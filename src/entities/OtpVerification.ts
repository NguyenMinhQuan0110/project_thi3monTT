import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'otp_verifications' })
class OtpVerification {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ unique: true })
    email?: string;

    @Column({ length: 6 })
    otp?: string;

    @Column()
    otp_expiry?: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at?: Date;
}

export default OtpVerification;