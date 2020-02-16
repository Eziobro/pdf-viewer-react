class PagingSeal {
    constructor () {
        this.type = sealType.PAGING_SEAL
        this.width = 150
        this.height = 150
        this.direction = 'RIGHT'
        this.offset = 0
    }

    setSize = (width, height) => {
        this.height = height
        this.width = width
    }

    setDirection = (direction) => {
        this.direction = direction
    }

    setOffset = (offset) => {
        this.offset = offset
    }

}

export class SealFactory {
    static createSeal (type) {
        switch (type) {
            case sealType.PAGING_SEAL:
                return new PagingSeal()
                break
            default:
                // TODO
                break
        }
    }
}

export const sealType = {
    PAGING_SEAL: 'PAGING_SEAL',
}
