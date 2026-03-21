import { prisma } from "@/libs/prisma";
import { FastifyReply, FastifyRequest, RequestGenericInterface } from "fastify"

interface RequestInterface extends RequestGenericInterface {}

interface VehicleInterface {
  id: number,
  name?: string | null,
  plate: string,  // ← Nunca null!
  latitude?: number | null,
  longitude?: number | null,
  date?: string | null,
}

function timestampToDateHourPtBr(timestamp: number) {
  return timestamp; // ← Envia número (segundos desde 1970)
}

// FUNÇÃO CRÍTICA: Extrai placa do nome se necessário
function extrairPlaca(nome: string | null | undefined, id: number): string {
  if (!nome) return `SEM_NOME_${id}`;
  
  // Tenta extrair padrão brasileiro do início do nome
  const match = nome.match(/^([A-Z]{3}[0-9][A-Z0-9][0-9]{2})\b/i);
  if (match) {
    return match[1].toUpperCase();
  }
  
  // Se não achou padrão no início, procura em qualquer lugar
  const match2 = nome.match(/([A-Z]{3}[0-9][A-Z0-9][0-9]{2})/i);
  if (match2) {
    return match2[1].toUpperCase();
  }
  
  return `SEM_PLACA_${id}`;
}

export const getVehiclesListController = async (request: FastifyRequest<RequestInterface>, reply: FastifyReply) => {
  try {
    const tokenResult = await prisma.token.findFirst({
      where: { id: 1 },
      select: { token: true },
    });

    if (!tokenResult?.token) {
      return reply.status(400).send({
        success: false,
        message: 'Token Wialon não encontrado no banco de dados',
      });
    }

    const token = tokenResult.token;

    // Login no Wialon
    const loginUrl = `${process.env.WIALON_API_URL}?svc=token/login&params=${encodeURIComponent(JSON.stringify({token, fl: 1}))}`;
    const loginRes = await fetch(loginUrl);
    const loginData = await loginRes.json();

    if (loginData.error) {
      return reply.status(400).send({
        success: false,
        message: `Erro login Wialon: ${loginData.error}`,
      });
    }

    const { eid } = loginData;

    // Buscar lista de veículos
    const listUrl = `${process.env.WIALON_API_URL}?svc=core/duplicate&${new URLSearchParams({
      params: JSON.stringify({operateAs:"",continueCurrentSession:false,checkService:"hosting_wialon_us",restore:1,appName:"web/hosting.wialon.us"}),
      sid: eid
    })}`;
    
    const listRes = await fetch(listUrl, { method: 'POST' });
    const listData = await listRes.json();

    if (listData.error) {
      return reply.status(400).send({
        success: false,
        message: `Erro ao listar veículos: ${listData.error}`,
      });
    }

    const user = listData.user || {};
    
    if (!user.prp?.monu) {
      return reply.status(400).send({
        success: false,
        message: 'Nenhum veículo encontrado na conta Wialon',
      });
    }

    let vehiclesList: number[] = [];
    try {
      vehiclesList = JSON.parse(user.prp.monu);
      if (!Array.isArray(vehiclesList)) {
        throw new Error('Formato inválido');
      }
    } catch (e) {
      return reply.status(400).send({
        success: false,
        message: 'Erro ao parsear lista de veículos do Wialon',
      });
    }

    // Buscar informações detalhadas
    const infoUrl = `${process.env.WIALON_API_URL}?svc=core/update_data_flags&${new URLSearchParams({
      params: JSON.stringify({spec:[{type:"col",data:vehiclesList,flags:4294967295,mode:1}]}),
      sid: eid
    })}`;

    const infoRes = await fetch(infoUrl, { method: 'POST' });
    const infoData = await infoRes.json();

    if (infoData.error) {
      return reply.status(400).send({
        success: false,
        message: `Erro ao buscar dados dos veículos: ${infoData.error}`,
      });
    }

    // Mapear veículos - GARANTINDO QUE PLATE NUNCA SEJA NULL
    const vehicles: VehicleInterface[] = vehiclesList.map((vehicleId: number) => {
      const info = infoData?.find((item: any) => item.i === vehicleId);
      
      if (!info?.d) {
        return {
          id: vehicleId,
          name: `Veículo ${vehicleId}`,
          plate: `ID_${vehicleId}`,  // ← Nunca null
          latitude: null,
          longitude: null,
          date: null,
        };
      }

      // Buscar placa nos campos personalizados (pflds)
      let plate: string | null = null;
      if (info.d.pflds) {
        const plateField = Object.values(info.d.pflds).find(
          (item: any) => item.n === 'registration_plate'
        );
        plate = plateField ? (plateField as any).v : null;
      }

      // CORREÇÃO DEFINITIVA: Se não achou placa, extrai do nome
      if (!plate) {
        plate = extrairPlaca(info.d.nm, vehicleId);
        console.log(`[BACKEND FIX] Veículo ${vehicleId}: placa extraída "${plate}" do nome "${info.d.nm}"`);
      }

      const timestamp = info.d.pos?.t;
      const dateStr = timestamp || null;
      console.log(`[DEBUG BACKEND] Tipo da data: ${typeof dateStr}, valor: ${dateStr}`);

      return {
        id: vehicleId,
        name: info.d.nm || `Veículo ${vehicleId}`,
        plate: plate,  // ← GARANTIDO: nunca null, nunca undefined
        latitude: info.d.pos?.y || null,
        longitude: info.d.pos?.x || null,
        date: dateStr,
      };
    });

    // DEBUG: Verifica se todas as placas estão preenchidas
    vehicles.forEach(v => {
      if (!v.plate || v.plate.includes('SEM_')) {
        console.error(`[ERRO] Veículo ${v.id} sem placa válida:`, v);
      }
    });

    // Enviar para VX Consult (agora com plate garantido)
    let success = false;
    let message = '';
    let vxResponse = null;

    if (vehicles.length > 0 && process.env.CONSULT_API) {
      const consultData = vehicles.map(v => ({
        id: v.id,
        name: v.name,
        plate: v.plate,  // ← Sempre preenchido!
        latitude: v.latitude,
        longitude: v.longitude,
        datahora: v.date,
      }));

      // LOG DEBUG - Ver o que está sendo enviado
      console.log('========================================');
      console.log('[VXConsult] Payload sendo enviado:');
      console.log(JSON.stringify(consultData, null, 2));
      console.log('[VXConsult] Total de veículos:', consultData.length);
      console.log('[VXConsult] Exemplo do primeiro:', consultData[0]);
      console.log('========================================');

      try {
        const sendRes = await fetch(process.env.CONSULT_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CONSULT_API_KEY}`,
          },
          body: JSON.stringify(consultData),
        });

        vxResponse = await sendRes.json();
        
        if (vxResponse?.success) {
          success = true;
          message = vxResponse.message || 'Dados enviados com sucesso para VX Consult';
        } else {
          success = false;
          message = vxResponse?.message || 'Falha ao enviar para VX Consult';
        }
      } catch (error: any) {
        console.error('Erro ao enviar para VX:', error);
        success = false;
        message = `Erro na comunicação: ${error.message}`;
      }
    } else {
      message = 'Nenhum veículo para enviar ou CONSULT_API não configurada';
    }

    return reply.status(200).send({ 
      vehicles,  // ← Agora com plate sempre preenchido
      success, 
      message,
      vxResponse: process.env.NODE_ENV === 'dev' ? vxResponse : undefined
    });

  } catch (error: any) {
    console.error('Erro geral:', error);
    return reply.status(500).send({
      success: false,
      message: `Erro interno: ${error.message}`,
      vehicles: [],
    });
  }
}