const GattService = {
    DailyKnee: { UUID: '0273d730-0736-42db-917a-0369eebd174d' },
    DK_DeviceId: { UUID: 'E625601E-9E55-4597-A598-76018A0D293D' }
}

const GattCharacteristic = {
    DK_Six_Dof: { UUID: '02730003-0736-42db-917a-0369eebd174d' },
    DK_Rotation_Vector: { UUID: '02730004-0736-42db-917a-0369eebd174d' },
    DK_DeviceId: { UUID: '26E2B12B-85F0-4F3F-9FDD-91D114270E6E' }
}

function extractSixDofData(bytes) {
    const ACC_CONST = 8192.0;
    const GYRO_CONST = 16.4;

    return {
        timestamp: bytes[0] << 8 + bytes[1],
        accX: (bytes[3] << 8 + bytes[2]) / ACC_CONST,
        accY: (bytes[5] << 8 + bytes[4]) / ACC_CONST,
        accZ: (bytes[7] << 8 + bytes[6]) / ACC_CONST,
        gyroX: (bytes[8] << 8 + bytes[9]) / GYRO_CONST,
        gyroY: (bytes[10] << 8 + bytes[11]) / GYRO_CONST,
        gyroZ: (bytes[12] << 8 + bytes[13]) / GYRO_CONST,
    };
}
