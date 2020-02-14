import React from "react";

const PAGE_RENDER_STATUS = {
    WAITING: 'WAITING', // 等待渲染
    LOADING: 'LOADING', // 加载中
    READY: 'READY', // 加载完成
    RELOAD: 'RELOAD', // 重新加载
    NEEDRELOAD: 'NEEDRELOAD', // 需要重新加载
    ERROR: 'ERROR' // 加载失败
}

const CSS_UNITS = 96.0 / 72.0;

class PageRender {
    constructor(docId, currentPage, prePageProxy, pdfProxy, renderListener) {
        this.docId = docId
        this.status = PAGE_RENDER_STATUS.WAITING // 渲染状态
        this.scale = (document.documentElement.clientWidth - 80) / 1280 // 渲染比例
        this.currentPage = currentPage // 当前页数
        this.pageCanvas = document.createElement('canvas') // 页面容器
        this.pdfProxy = pdfProxy // pdf对象
        this.prePageProxy = prePageProxy
        this.pageProxy = null // 页面代理
        this.renderTask = null // 渲染任务代理
        this.renderListener = renderListener
    }

    drawCanvas = async () => {
        const canvas = this.pageCanvas
        const context = canvas.getContext('2d')
        this.status = PAGE_RENDER_STATUS.READY
        if (this.pageProxy === null) {
            this.status = PAGE_RENDER_STATUS.ERROR
            return PAGE_RENDER_STATUS.ERROR
        }
        if (canvas == null) {
            // TODO: canvas error
            console.log('TODO: canvas error')
            return
        }
        const viewport = this.pageProxy.getViewport({scale: this.scale * CSS_UNITS})
        canvas.width = viewport.width
        canvas.height = viewport.height
        const renderContext = {
            transform: [CSS_UNITS, 0, 0, CSS_UNITS, 0, 0],
            canvasContext: context,
            viewport: viewport,
            enableWebGL: true,
        }

        this.renderTask = this.pageProxy.render(renderContext)
        this.renderTask.promise.then(_ => {
            this.status = PAGE_RENDER_STATUS.READY
            this.renderTask = null
            this.renderListener.onPageRenderedSuccess()
        })
    }

    render = async () => {
        // 加载中 重新加载 已完成 => 都已经完成渲染
        if (this.status === PAGE_RENDER_STATUS.RELOAD ||
            this.status === PAGE_RENDER_STATUS.LOADING ||
            this.status === PAGE_RENDER_STATUS.READY) {
            return
        }

        // 等待 出错 => 都需要重新渲染
        if (this.status === PAGE_RENDER_STATUS.WAITING ||
            this.status === PAGE_RENDER_STATUS.ERROR) {
            this.status = PAGE_RENDER_STATUS.LOADING
        }

        if (this.status === PAGE_RENDER_STATUS.NEEDRELOAD) {
            this.status = PAGE_RENDER_STATUS.LOADING
        }

        this.doRender()
    }

    doRender = async () => {
        console.time(`页面${this.currentPage}渲染时间`)
        if (this.pageProxy) {
            return this.drawCanvas()
        } else {
            this.pdfProxy.getPage(this.currentPage).then(proxy => {
                this.pageProxy = proxy
                return this.drawCanvas()
            }, err => {
                console.log('err', err)
                Promise.reject(err)
            })
        }
    }

    getPageProxy = () => {
        return this.pageProxy || this.prePageProxy
    }

    getPageShowSize = (scale = this.scale) => {
        const viewport = this.getPageProxy().getViewport({scale: scale * CSS_UNITS})
        return {
            width: viewport.width,
            height: viewport.height
        }
    }

}

export {
    PageRender,
    PAGE_RENDER_STATUS
}