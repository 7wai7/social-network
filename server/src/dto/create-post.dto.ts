import { FileDto } from "./create-file.dto";

export class PostDto {
    readonly user_id: number;
    readonly text: string;
    readonly files?: FileDto[]
}