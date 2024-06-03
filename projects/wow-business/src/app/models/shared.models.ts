export interface IListRequest {
	providerId: number;
	searchTerm?: string;
}

export interface IFileUploadResponse {
	fileTitle: string;
	logoPath: string | number;
	fileType: string;
}


export interface ISignal {
	action: string;
	subAction?: string;
	data: any;
	subData?: any;
}