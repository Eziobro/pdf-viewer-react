import React, { Component } from 'react'
import pdfjsLib from 'pdfjs-dist/webpack'
import PageCanvas from './pageCanvas'
import { debounce, ENUM } from './utils'

import './index.css'

function createKey (docId, pageNum) {
    return `${docId}_${pageNum}`
}

export default class PDFViewer extends Component {
    constructor (props) {
        super(props)
        this.pageRenders = []   // 存放每页pdf形成的canvas
        this.pageRenderRef = React.createRef()  //渲染pdf的容器
        this.state = {
            scale: (document.documentElement.clientWidth - ENUM.marginLeft * 2) / 1280,
            pages: [],
            docId: 1,
            documentSize: {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            },
            scrollTop: 0
        }
    }

    componentDidMount () {
        this.init()
        window.addEventListener('resize', this.onResizeChange)
        this.pageRenderRef.current.scrollTop = 0
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onResizeChange)
    }

    // 监听浏览器变化
    onResizeChange = (e) => {
        const { clientHeight, clientWidth } = document.documentElement
        this.setState({
            documentSize: {
                width: clientWidth,
                height: clientHeight
            }
        })
    }
    // 初始化pdf
    init = async () => {
        console.time('pdf加载时间')
        let pages = []
        const { docId } = this.state
        const pdf = await pdfjsLib.getDocument({
            url: 'http://118.24.181.207/test2.pdf',
            // rangeChunkSize: 65536 * 16
        })
        const { numPages } = pdf
        for (let currentPage = 1; currentPage <= numPages; currentPage++) {
            const _page = await pdf.getPage(currentPage)
            _page.docId = docId
            pages.push(_page)
        }
        this.setState({
            pages
        })
        console.timeEnd('pdf加载时间')

        this.setState({
            scrollTop: this.pageRenderRef.current.scrollTop
        })
    }

    onScroll = () => {
        this.setState({
            scrollTop: this.pageRenderRef.current.scrollTop
        })
    }

    render () {
        const { pages, scale, documentSize, scrollTop } = this.state
        return (
          <div ref={this.pageRenderRef} className='pdfFrame'
               onScroll={debounce(this.onScroll, 1000 / 60, true)}
               style={{ height: documentSize.height + 'px' }}>
              {
                  pages.map(_page =>
                    <PageCanvas
                      docId={_page.docId}
                      pageNum={_page.pageIndex}
                      key={createKey(_page.docId, _page.pageIndex)}
                      scale={scale}
                      pageProxy={_page} scrollTop={scrollTop || 0}
                    />)
              }
          </div>
        )
    }
}
