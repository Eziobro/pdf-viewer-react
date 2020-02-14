export class VerticalLayout {
    constructor() {
        this.marignHorizontalMarign = 20
        this.marginTop = 20
        this.offsetWidth = document.documentElement.offsetWidth
    }

    // 计算页面位置信息
    computePageSize = (pageRenders) => {
        return pageRenders.map((pageRender, index) => {
            const {width, height} = pageRender.getPageShowSize()
            const {currentPage, docId} = pageRender
            return {
                width,
                height: height,
                top: (height + this.marginTop) * (currentPage - 1) + this.marginTop,
                left: (this.offsetWidth - width) / 2,
                currentPage,
                docId
            }
        })
    }

    // 计算文档大小
    computeDocSize = (pageSizes) => {
        let width = 0
        let height = 0
        pageSizes.forEach(pageSize => {
            width = pageSize.width
            height += pageSize.height + this.marginTop
        })
        height += this.marginTop
        return {width, height}
    }
}