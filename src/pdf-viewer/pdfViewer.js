import React, {Component} from "react";
import pdfjsLib from 'pdfjs-dist/webpack';
import {VerticalLayout} from './verticalLayout'
import {PageRender} from './pageRender'
import RenderPage from "./render-page";
import {debounce, getKey} from './utils'

import style from './index.less'

export default class PDFViewer extends Component {
    constructor(props) {
        super(props);
        this.pageRenders = []
        this.layout = new VerticalLayout() // 页面布局算法
        this.pageRect = [] // 页面信息
        this.pageRenderMap = {}
        this.showPageInfo = [] // 当前可见页面
        this.docSize = {}
        this.state = {
            documentSize: {
                height: document.documentElement.clientHeight,
                width: document.documentElement.clientWidth,
            }
        }

        this.init()
        this.docContainRef = React.createRef()
        this.scrollContainerRef = React.createRef()
    }

    init = async () => {
        console.time('pdf加载时间')
        const pdf = await pdfjsLib.getDocument('https://ezio-1257652981.cos.ap-chengdu.myqcloud.com/doc/test.pdf')
        console.timeEnd('pdf加载时间')
        const {_pdfInfo: {numPages}} = pdf
        this.numPages = numPages
        let _pages = []
        let _pageMap = {}
        const firstPageRender = await pdf.getPage(1)
        for (let _page = 1; _page <= numPages; _page++) {
            const pageRenderObj = new PageRender(1, _page, firstPageRender, pdf, this)
            _pages.push(pageRenderObj)
            _pageMap[getKey(1, _page)] = pageRenderObj
        }
        this.pageRenders = _pages
        this.pageRect = this.layout.computePageSize(_pages)
        this.pageRenderMap = _pageMap

        this.getDocSize();
        this.renderDocSize();
        this.computeCurrentShowPageInfos()
        this.renderPage()
        this.forceUpdate()
    }

    componentDidMount() {
        window.addEventListener('scroll', this.scrollEvent, true)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    onPageRenderedSuccess() {
        this.forceUpdate()
    }

    // 获得文档大小
    getDocSize = () => {
        console.info('getDocSize')
        const pageRects = this.pageRect
        this.docSize = this.layout.computeDocSize(pageRects)
    }

    // 重新渲染文档大小
    renderDocSize = () => {
        console.info('renderDocSize')
        const el = this.docContainRef.current
        if (!el) return
        let docSize = this.docSize;
        el.style.width = docSize.width + 'px';
        el.style.height = docSize.height + 'px';
    }

    //计算当前可见页面
    computeCurrentShowPageInfos() {
        let scrollContainer = this.scrollContainerRef.current
        if (!scrollContainer) return []
        const pageRects = this.pageRect
        const scrollContainerRect = scrollContainer.getBoundingClientRect()
        const {documentSize: {height: viewHeight}} = this.state
        const {top} = scrollContainerRect
        const viewTop = Math.abs(top)
        const showPagesSet = new Set()
        pageRects.forEach((pageRect, i) => {
            if (pageRect.top < viewTop + viewHeight &&
                pageRect.top + pageRect.height > viewTop) {
                if (pageRects[i - 1]) showPagesSet.add(pageRects[i - 1])
                showPagesSet.add(pageRects[i])
                if (pageRects[i + 1]) showPagesSet.add(pageRects[i + 1])
            }
        });
        this.showPageInfo = [...showPagesSet]
    }

    renderPage = () => {
        this.showPageInfo.forEach(page => {
            const {docId, currentPage} = page
            this.pageRenderMap[getKey(docId, currentPage)].render()
        })
    }

    scrollEvent = () => {
        console.info('scroll')
        this.computeCurrentShowPageInfos()
        this.renderPage()
    }

    render() {
        console.info('render')
        return (
            <div ref={this.scrollContainerRef} className='scrollViewerContainer'
                 onScroll={this.scrollEvent}>
                <div ref={this.docContainRef} className="documentContainer">
                    {
                        this.showPageInfo.map(rect => {
                            const {docId, currentPage, top, left, width, height} = rect
                            const renderPageStyle = {
                                top,
                                left,
                                width,
                                height
                            }
                            return (
                                <div className={style.renderPage} style={renderPageStyle}
                                     key={getKey(docId, currentPage)}>
                                    <RenderPage pageRender={this.pageRenderMap[getKey(docId, currentPage)]}/>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}
