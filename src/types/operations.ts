export type Vehicle = {
    id: number;
    tipo: string;
    modelo: string;
    placa: string;
    qtEixos: number;
    kmRodado: number;
};

export type Driver = {
    id: number;
    nome: string;
    telefone: string;
    funcao: string;
    comissao: number;
};

export type Destination = {
    id: number;
    nome: string;
    endereco: string;
    numero: string;
};

export type DailyLog = {
    id: number;
    data: string;
    nrNota: string;
    valorFrete: number;
    kmSaida: number;
    kmChegada: number;
    metroTonelada: number;
    vehicleId: number;
    driverId: number;
    originId: number;
    destinationId: number;
    vehicleLabel?: string;
    driverName?: string;
    originName?: string;
    destinationName?: string;
};

export type Fueling = {
    id: number;
    data: string;
    qtLitrosInicial: number;
    qtLitrosFinal: number;
    valorLitroDiesel: number;
    observacoes: string;
    vehicleId: number;
    employeeId: number;
    vehicleLabel?: string;
    employeeName?: string;
    employeeRole?: string;
};

export type Maintenance = {
    id: number;
    tipo: string;
    data: string;
    valor: number;
    responsavel: string;
    observacoes: string;
    vehicleId: number;
    employeeId: number;
    vehicleLabel?: string;
    employeeName?: string;
    employeeRole?: string;
};
