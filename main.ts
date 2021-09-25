//
/**
 * APDS-9960
 */
//% weight=100 color=#00A654 icon="\uf0a0" block="APDS-9960"

//% color="#31C7D5" weight=10 icon="\uf06e"
namespace apds9960 {
    const ADDR = 0x39
    const APDS9960_RAM = 0x00
    const APDS9960_ENABLE = 0x80
    const APDS9960_ATIME = 0x81
    const APDS9960_WTIME = 0x83
    const APDS9960_AILTIL = 0x84
    const APDS9960_AILTH = 0x85
    const APDS9960_AIHTL = 0x86
    const APDS9960_AIHTH = 0x87
    const APDS9960_PILT = 0x89
    const APDS9960_PIHT = 0x8B
    const APDS9960_PERS = 0x8C
    const APDS9960_CONFIG1 = 0x8D
    const APDS9960_PPULSE = 0x8E
    const APDS9960_CONTROL = 0x8F
    const APDS9960_CONFIG2 = 0x90
    const APDS9960_ID = 0x92
    const APDS9960_STATUS = 0x93
    const APDS9960_CDATAL = 0x94
    const APDS9960_CDATAH = 0x95
    const APDS9960_RDATAL = 0x96
    const APDS9960_RDATAH = 0x97
    const APDS9960_GDATAL = 0x98
    const APDS9960_GDATAH = 0x99
    const APDS9960_BDATAL = 0x9A
    const APDS9960_BDATAH = 0x9B
    const APDS9960_PDATA = 0x9C
    const APDS9960_POFFSET_UR = 0x9D
    const APDS9960_POFFSET_DL = 0x9E
    const APDS9960_CONFIG3 = 0x9F
    const APDS9960_GPENTH = 0xA0
    const APDS9960_GEXTH = 0xA1
    const APDS9960_GCONF1 = 0xA2
    const APDS9960_GCONF2 = 0xA3
    const APDS9960_GOFFSET_U = 0xA4
    const APDS9960_GOFFSET_D = 0xA5
    const APDS9960_GOFFSET_L = 0xA7
    const APDS9960_GOFFSET_R = 0xA9
    const APDS9960_GPULSE = 0xA6
    const APDS9960_GCONF3 = 0xAA
    const APDS9960_GCONF4 = 0xAB
    const APDS9960_GFLVL = 0xAE
    const APDS9960_GSTATUS = 0xAF
    const APDS9960_IFORCE = 0xE4
    const APDS9960_PICLEAR = 0xE5
    const APDS9960_CICLEAR = 0xE6
    const APDS9960_AICLEAR = 0xE7
    const APDS9960_GFIFO_U = 0xFC
    const APDS9960_GFIFO_D = 0xFD
    const APDS9960_GFIFO_L = 0xFE
    const APDS9960_GFIFO_R = 0xFF

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function rgb2hue(r: number, g: number, b: number): number {
        // no float support for pxt ts
        r = r * 100 / 255;
        g = g * 100 / 255;
        b = b * 100 / 255;

        let max = Math.max(r, Math.max(g, b))
        let min = Math.min(r, Math.min(g, b))
        let c = max - min;
        let hue = 0;
        let segment = 0;
        let shift = 0;
        if (c != 0) {
            switch (max) {
                case r:
                    segment = (g - b) * 100 / c;
                    shift = 0;       // R° / (360° / hex sides)
                    if (segment < 0) {          // hue > 180, full rotation
                        shift = 360 / 60;         // R° / (360° / hex sides)
                    }
                    hue = segment + shift;
                    break;
                case g:
                    segment = (b - r) * 100 / c;
                    shift = 200;     // G° / (360° / hex sides)
                    hue = segment + shift;
                    break;
                case b:
                    segment = (r - g) * 100 / c;
                    shift = 400;     // B° / (360° / hex sides)
                    hue = segment + shift;
                    break;
            }

        }
        return hue * 60/100;
    }

    //% blockId=apds9960_init block="APDS9960 Init"
    //% weight=100
    export function Init(): void {
        i2cwrite(ADDR, APDS9960_ATIME, 252) // default inte time 4x2.78ms
        i2cwrite(ADDR, APDS9960_CONTROL, 0x03) // todo: make gain adjustable
        i2cwrite(ADDR, APDS9960_ENABLE, 0x00) // put everything off
        i2cwrite(ADDR, APDS9960_GCONF4, 0x00) // disable gesture mode
        i2cwrite(ADDR, APDS9960_AICLEAR, 0x00) // clear all interrupt
        // power on
        i2cwrite(ADDR, APDS9960_ENABLE, 0x01) // clear all interrupt
    }

    //% blockId=apds9960_getid
    //% block="ID"
    //% weight=99
    export function id(): number {
        let chipid = i2cread(ADDR, APDS9960_ID); //It should return 171(0xAB)
        return chipid;
    }

    //% blockId=apds9960_getstatus
    //% block="STATUS"
    //% weight=98
    export function id(): number {
        let chipid = i2cread(ADDR, APDS9960_ID);
        return chipid;
    }

    //% blockId=apds9960_readcolor
    //% block="Get Color"
    //% weight=97
    export function ReadColor(): number {
        let tmp = i2cread(ADDR, APDS9960_ENABLE) | 0x2;
        i2cwrite(ADDR, APDS9960_ENABLE, tmp);
        basic.pause(10);
        let c = i2cread(ADDR, APDS9960_CDATAL) + i2cread(ADDR, APDS9960_CDATAH)*256;
        let r = i2cread(ADDR, APDS9960_RDATAL) + i2cread(ADDR, APDS9960_RDATAH)*256;
        let g = i2cread(ADDR, APDS9960_GDATAL) + i2cread(ADDR, APDS9960_GDATAH)*256;
        let b = i2cread(ADDR, APDS9960_BDATAL) + i2cread(ADDR, APDS9960_BDATAH)*256;
        // map to rgb based on clear channel
        let avg = c/3;
        r = r*255/avg;
        g = g*255/avg;
        b = b*255/avg;
        let hue = rgb2hue(r,g,b);
        return hue
    }

    //% blockId=apds9960_readdistance
    //% block="Get Distance"
    //% weight=96
    export function ReadDistance(): number {
        let tmp = i2cread(ADDR, APDS9960_ENABLE) | 0x4;
        i2cwrite(ADDR, APDS9960_ENABLE, tmp);
        basic.pause(10);
        let distance = i2cread(ADDR, APDS9960_PDATA);
        return distance
    }

}
