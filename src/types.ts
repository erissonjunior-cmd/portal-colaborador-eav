/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DemandedSectorActivity {
  sectorName: string;
  responsiblePerson: string;
  demandDescription: string;
}

export interface SchoolEvent {
  id: string;
  requester: string;          // Setor solicitante (ex: Assistente de Direção)
  requestDate: string;        // Data de requisição
  title: string;              // Nome do evento
  date: string;               // Data (ex: 08/05/26)
  startTime: string;          // Horário de início
  endTime: string;            // Horário de término
  responsibleSector: string;  // Setor responsável
  location: string;           // Local (ex: Multiuso Arts Center)
  campus?: 'Vitória' | 'Álvares' | 'Aeroporto'; // Campus do evento (Vitória, Álvares ou Aeroporto)
  objective: string;          // Objetivo
  targetAudience: string;     // Público-alvo
  audienceEstimate: string;   // Estimativa de público (ex: 50 pessoas)
  sectorsInvolved: string[];  // Setores envolvidos (ex: Board, Diretoria Geral, TI, etc.)
  demands: DemandedSectorActivity[]; // Setores demandados e as respectivas atividades
  status: 'pending' | 'approved' | 'rejected';
}

export interface SupportRequest {
  id: string;
  eventId?: string;           // Evento relacionado (opcional)
  eventTitle?: string;        // Nome do evento relacionado (se aplicável)
  category: 'IT' | 'Maintenance' | 'Marketing' | 'EventPlanning' | 'Other';
  title: string;              // Resumo / Tipo de suporte solicitado
  requesterName: string;      // Nome do colaborador solicitante
  requesterEmail: string;     // E-mail do colaborador
  description: string;        // Descrição detalhada do suporte
  links: string[];            // Links anexados para apresentação
  videos: {
    name: string;
    url: string;
    displayType: 'embed' | 'link';
  }[];                        // Vídeos anexados (YouTube, Drive, Vimeo, etc.)
  attachments: {
    name: string;
    url: string;
    size: string;
  }[];                        // Simulação de arquivos anexados
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
}

export const SCHOOL_SECTORS = [
  "Board",
  "Diretoria Geral (CEO)",
  "Coordenação de Admissions",
  "Coordenação de Marketing",
  "Principal",
  "Assistente da Coordenação pedagógica",
  "Coordenação Pedagogógica Preschool",
  "Orientação Pedagógica Preschool",
  "Coordenação Pedagógica Elementary School",
  "Orientação Pedagógica Elementary",
  "Coordenação Pedagógica Middle e High School",
  "Orientação Pedagógica Middle e High School",
  "IB MYP Coordinator",
  "Head Educação Inclusiva & Coordenação do Programa de Anos Intermediários do IB",
  "Head AP Programas Internacionais",
  "Head de Português",
  "Head de Educação Física",
  "Inspetor Escolar",
  "Biblioteca",
  "Chief Operating Officer (COO)",
  "Coordenação Afterschool",
  "Coordenação Administrativa",
  "Recepção",
  "Recursos Humanos",
  "Enfermagem",
  "Nutrição/SODEXO",
  "Secretaria Escolar",
  "Assistente de diretoria",
  "Coordenação Financeira",
  "Departamento Pessoal",
  "Suprimentos",
  "Coordenação Operacional",
  "Portaria interna",
  "TI"
];

export const SCHOOL_LOCATIONS = [
  "Multiuso Arts Center",
  "Auditório Principal",
  "Quadra Poliesportiva",
  "Biblioteca Central",
  "Sala de Reuniões Boardroom",
  "Pátio das Palmeiras",
  "Laboratório de Ciências",
  "Maker Space",
  "Refeitório Principal",
  "Sala de Música",
  "Área Externa / Jardim"
];

export const SCHOOL_CAMPUSES = ["Vitória", "Álvares", "Aeroporto"] as const;

export interface SectorEmails {
  [sector: string]: string[];
}


