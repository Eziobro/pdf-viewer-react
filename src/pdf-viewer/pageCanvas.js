import React, { Component } from 'react'
import { ENUM } from './utils'

import './index.css'

function createKey (docId, pageNum) {
    return `${docId}_${pageNum}`
}

export default class PageCanvas extends Component {
    constructor (props) {
        super(props)
        const { pageProxy, scale } = props
        const { docId, pageIndex, numPages } = pageProxy
        const ratio = window.devicePixelRatio
        const { width, height } = pageProxy.getViewport({ scale: scale * ratio })
        const top = (height + ENUM.marginTop) * pageIndex
        const left = (document.documentElement.clientWidth - width) / 2
        this.state = {
            docId,
            pageNum: pageIndex,
            top,
            left,
            width,
            height,
            pageTotal: numPages,
            ratio
        }
        this.prePageCanvas = null
        this.canvasRef = React.createRef()
        this.renderPageRef = React.createRef()
    }

    componentDidMount () {
        const { scrollTop } = this.props
        const { clientWidth, clientHeight } = document.documentElement
        const { top: offsetTop, height, ratio } = this.state
        if (offsetTop > scrollTop - height && offsetTop < scrollTop + clientHeight + height) {
            const canvas = this.canvasRef.current
            const context = canvas.getContext('2d')
            const { pageProxy, scale } = this.props
            const viewport = pageProxy.getViewport({ scale: scale * ratio })
            canvas.width = viewport.width
            canvas.height = viewport.height
            const renderContext = {
                // transform: [CSS_UNITS, 0, 0, CSS_UNITS, 0, 0],
                canvasContext: context,
                viewport: viewport,
                enableWebGL: true,
            }
            pageProxy.render(renderContext)
            this.prePageCanvas = context
            this.forceUpdate()
        }
    }

    shouldComponentUpdate (nextProps, nextState, nextContext) {
        const { scrollTop } = this.props
        const { clientWidth, clientHeight } = document.documentElement
        const { top: offsetTop, height } = this.state
        if (offsetTop < scrollTop - height || offsetTop > scrollTop + clientHeight + height) {
            return false
        }
        return true
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
        if (!this.prePageCanvas) {
            this.prePageCanvas = null
            const ratio = window.devicePixelRatio
            const canvas = this.canvasRef.current
            const context = canvas.getContext('2d')
            const { pageProxy, scale } = this.props
            const viewport = pageProxy.getViewport({ scale: scale * ratio })
            canvas.width = viewport.width
            canvas.height = viewport.height
            const renderContext = {
                // transform: [CSS_UNITS, 0, 0, CSS_UNITS, 0, 0],
                canvasContext: context,
                viewport: viewport,
                enableWebGL: true,
            }
            pageProxy.render(renderContext)
            this.prePageCanvas = context
        }
    }

    render () {
        const { top, left, width, height, docId, pageNum, pageTotal } = this.state
        const renderPageStyle = {
            top,
            left,
            width,
            height,
            position: 'absolute',
        }
        return (
          <div ref={this.renderPageRef} style={renderPageStyle} className='renderPage'>
              <canvas className='pageCanvas' ref={this.canvasRef}/>
              {
                  this.prePageCanvas ?
                    this.props.interiors.map((interior, index) => {
                        return <this.props.interiorRender
                          key={createKey(docId, index)}
                          arg={interior}
                          docId={docId} pageNum={pageNum} pageTotal={pageTotal}
                          docWidth={width} docHeight={height}
                        />
                    })
                    : <div className='loadingStyle'>加载中............
                    </div>
              }
          </div>
        )
    }
}
