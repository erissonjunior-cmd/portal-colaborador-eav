/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchoolEvent, SupportRequest, SectorEmails } from '../types';

export const INITIAL_EVENTS: SchoolEvent[] = [
  {
    id: "evt-nasa-post-2026",
    requester: "Assistente de Direção",
    requestDate: "2026-04-28",
    title: "Reunião pós viagem NASA",
    date: "2026-06-08",
    startTime: "08:00",
    endTime: "09:00",
    responsibleSector: "Direção",
    location: "Multiuso Arts Center",
    campus: "Vitória",
    objective: "Feedback sobre a viagem realizada para a NASA e alinhamento de próximos passos",
    targetAudience: "Membros da tripulação, alunos participantes e respectivas famílias",
    audienceEstimate: "50 pessoas",
    sectorsInvolved: [
      "Board",
      "Diretoria Geral (CEO)",
      "Coordenação de Marketing",
      "Principal",
      "Assistente da Coordenação pedagógica",
      "Coordenação Pedagógica Middle e High School",
      "Head Educação Inclusiva & Coordenação do Programa de Anos Intermediários do IB",
      "Recepção",
      "Suprimentos",
      "Coordenação Operacional",
      "TI"
    ],
    demands: [
      {
        sectorName: "Board (Mariana Buaiz)",
        responsiblePerson: "Mariana Buaiz",
        demandDescription: "Abertura oficial e apresentação dos resultados acadêmicos obtidos na viagem de ciências."
      },
      {
        sectorName: "Diretoria Geral (CEO)",
        responsiblePerson: "Cristiano Bezerra de Carvalho",
        demandDescription: "Participação institucional e validação do relatório de atividades internacionais."
      },
      {
        sectorName: "Coordenação de Marketing",
        responsiblePerson: "Renata Barros Pereira & Angélica Cardoso Araújo",
        demandDescription: "Cobertura completa do evento: fotos institucionais, captação de depoimentos e produção de vídeo de melhores momentos."
      },
      {
        sectorName: "Principal",
        responsiblePerson: "Jennifer Rocha",
        demandDescription: "Acompanhamento acadêmico e discurso de agradecimento ao engajamento das famílias."
      },
      {
        sectorName: "TI",
        responsiblePerson: "Setor de Tecnologia",
        demandDescription: "Configuração do telão de alta definição, microfones sem fio na arena e transmissão via link restrito."
      }
    ],
    status: 'approved'
  },
  {
    id: "evt-open-house-2026",
    requester: "Coordenação de Admissions",
    requestDate: "2026-05-10",
    title: "EAV Open House & Experience Day",
    date: "2026-06-15",
    startTime: "09:00",
    endTime: "12:00",
    responsibleSector: "Coordenação de Admissions",
    location: "Auditório Principal",
    campus: "Álvares",
    objective: "Apresentação da metodologia pedagógica internacional para novas famílias potenciais",
    targetAudience: "Pais interessados e alunos visitantes",
    audienceEstimate: "120 pessoas",
    sectorsInvolved: [
      "Diretoria Geral (CEO)",
      "Coordenação de Admissions",
      "Coordenação de Marketing",
      "Recepção",
      "Nutrição/SODEXO",
      "Coordenação Operacional",
      "TI"
    ],
    demands: [
      {
        sectorName: "Coordenação de Admissions",
        responsiblePerson: "Carla Albuquerque",
        demandDescription: "Guia e recepção de famílias, entrega de sacolas de brindes e folhas de dados cadastrais."
      },
      {
        sectorName: "Nutrição/SODEXO",
        responsiblePerson: "Gerente Sabor e Nutrição",
        demandDescription: "Coffeebreak saudável para os visitantes no hall de entrada do auditório."
      },
      {
        sectorName: "TI",
        responsiblePerson: "Suporte de Hardware",
        demandDescription: "Vídeo institucional em loop no telão e som de fundo ambiente antes de iniciarem os discursos."
      }
    ],
    status: 'pending'
  },
  {
    id: "evt-science-fair-2026",
    requester: "Coordenação Pedagógica Elementary School",
    requestDate: "2026-05-18",
    title: "Feira de Inovações Científicas e Sustentabilidade",
    date: "2026-06-25",
    startTime: "13:30",
    endTime: "17:30",
    responsibleSector: "Coordenação Pedagógica Elementary School",
    location: "Quadra Poliesportiva",
    campus: "Aeroporto",
    objective: "Exposição interativa dos projetos científicos criados pelos alunos",
    targetAudience: "Comunidade escolar geral, professores e familiares",
    audienceEstimate: "350 pessoas",
    sectorsInvolved: [
      "Coordenação de Marketing",
      "Membros da Coordenação pedagógica",
      "Inspetor Escolar",
      "Suprimentos",
      "Coordenação Operacional",
      "TI"
    ],
    demands: [
      {
        sectorName: "Coordenação Operacional",
        responsiblePerson: "Vanderlei Souza",
        demandDescription: "Montagem de 35 cavaletes e mesas com fontes de energia para os experimentos."
      },
      {
        sectorName: "TI",
        responsiblePerson: "Suporte TI Geral",
        demandDescription: "Extensões elétricas robustas em todas as bancadas e 4 pontos de acesso Wi-Fi temporários."
      }
    ],
    status: 'approved'
  }
];

export const INITIAL_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: "sup-9817",
    eventId: "evt-nasa-post-2026",
    eventTitle: "Reunião pós viagem NASA",
    category: "IT",
    title: "Suporte para Projeção de Vídeo e Apresentação Principal",
    requesterName: "Letícia Fernandes",
    requesterEmail: "leticia.fernandes@escolaamericana.com.br",
    description: "Precisamos que o telão principal do Arts Center esteja pré-configurado com a nossa apresentação do Google Slides e que o vídeo com os melhores depoimentos da viagem (anexado abaixo) seja exibido sem falhas de áudio. É de extrema importância testar o som surround do local.",
    links: [
      "https://docs.google.com/presentation/d/e/2PACX-1vT3o6d78Y_NASA_Presentation_EAV/embed?start=false&loop=false&delayms=3000",
      "https://escolaamericana.com.br/nosso-espaco"
    ],
    videos: [
      {
        name: "Vídeo NASA EAV - Melhores Momentos",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Exemplo de embed padrão
        displayType: "embed"
      },
      {
        name: "Tour Espacial Virtual dos Alunos",
        url: "https://www.youtube.com/embed/y881t8ilYcw",
        displayType: "embed"
      }
    ],
    attachments: [
      {
        name: "roteiro_apresentacao_nasa.pdf",
        url: "#",
        size: "1.4 MB"
      },
      {
        name: "fotos_oficiais_grupo_nasa.zip",
        url: "#",
        size: "45 MB"
      }
    ],
    createdAt: "2026-05-24T10:15:00Z",
    status: "pending",
    priority: "high"
  },
  {
    id: "sup-0219",
    eventId: "evt-open-house-2026",
    eventTitle: "EAV Open House & Experience Day",
    category: "Marketing",
    title: "Gravação e Vídeo Promocional da Visita Guiada",
    requesterName: "Gustavo Valente",
    requesterEmail: "gustavo.valente@escolaamericana.com.br",
    description: "Necessidade de apoio de fotógrafo dedicado para percorrer as instalações externas da escola registrando os sorrisos das novas famílias e gerando recortes curtos de vídeo para postagens de story imediatos no Instagram oficial.",
    links: [
      "https://www.instagram.com/escolaamericanavitoria/"
    ],
    videos: [
      {
        name: "Exemplo de Vídeo TikTok/Reels de Visitas Passadas",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        displayType: "link"
      }
    ],
    attachments: [
      {
        name: "diretrizes_de_marca_eav.pdf",
        url: "#",
        size: "3.2 MB"
      }
    ],
    createdAt: "2026-05-25T08:30:00Z",
    status: "in_progress",
    priority: "medium"
  },
  {
    id: "sup-4412",
    eventId: "evt-science-fair-2026",
    eventTitle: "Feira de Inovações Científicas e Sustentabilidade",
    category: "Maintenance",
    title: "Distribuição e Verificação Elétrica da Quadra Esportiva",
    requesterName: "Renato Silveira",
    requesterEmail: "renato.silveira@escolaamericana.com.br",
    description: "Solicitamos a instalação temporária de tapetes emborrachados isolantes em cima de todas as fiações de extensão da quadra poliesportiva. Como teremos experimentos com água e outros com corrente elétrica próxima, essa medida preventiva de segurança do trabalho é indispensável.",
    links: [],
    videos: [],
    attachments: [
      {
        name: "mapa_layout_stands_eletrica.pdf",
        url: "#",
        size: "820 KB"
      }
    ],
    createdAt: "2026-05-22T14:10:00Z",
    status: "resolved",
    priority: "high"
  }
];

export const INITIAL_SECTOR_EMAILS: SectorEmails = {
  "TI": ["erisson.junior@escolaamericana.com.br", "esribeirojunior@gmail.com", "suporte.ti@escolaamericana.com.br"],
  "Coordenação de Marketing": ["marketing@escolaamericana.com.br", "branding@escolaamericana.com.br"],
  "Diretoria Geral (CEO)": ["diretoria@escolaamericana.com.br"],
  "Chief Operating Officer (COO)": ["coo@escolaamericana.com.br", "operacoes@escolaamericana.com.br"],
  "Secretaria Escolar": ["secretaria@escolaamericana.com.br"],
  "Suprimentos": ["suprimentos@escolaamericana.com.br"],
  "Coordenação Operacional": ["operacional@escolaamericana.com.br"],
  "Recepção": ["recepcao@escolaamericana.com.br"]
};

