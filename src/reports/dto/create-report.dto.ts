import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt } from "class-validator";

export class CreateReportDto {
    @ApiProperty()
    @IsInt()
    user_id: number;

    @ApiProperty()
    @IsDateString()
    start_date: string;

    @ApiProperty()
    @IsDateString()
    end_date: string;
}
