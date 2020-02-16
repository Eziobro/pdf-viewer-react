import React, { Component } from 'react'
import { ENUM } from './utils'

import './index.css'

export default class PageCanvas extends Component {
    constructor (props) {
        super(props)
        const { pageProxy, scale } = props
        const { docId, pageIndex } = pageProxy
        const { width, height } = pageProxy.getViewport({ scale })
        const top = (height + ENUM.marginTop) * pageIndex
        const left = (document.documentElement.clientWidth - width) / 2
        this.state = {
            docId,
            pageNum: pageIndex,
            top,
            left,
            width,
            height
        }
        this.prePageCanvas = null
        this.canvasRef = React.createRef()
        this.renderPageRef = React.createRef()
    }

    componentDidMount () {
        const { scrollTop } = this.props
        const { clientWidth, clientHeight } = document.documentElement
        const { top: offsetTop, height } = this.state
        if (offsetTop > scrollTop - height && offsetTop < scrollTop + clientHeight + height) {
            const canvas = this.canvasRef.current
            const context = canvas.getContext('2d')
            const { pageProxy, scale } = this.props
            const viewport = pageProxy.getViewport({ scale })
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
            const canvas = this.canvasRef.current
            const context = canvas.getContext('2d')
            const { pageProxy, scale } = this.props
            const viewport = pageProxy.getViewport({ scale })
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
        // const { pageWidth, pageHeight } = this.state
        const { top, left, width, height } = this.state
        const renderPageStyle = {
            top,
            left,
            width,
            height,
            position: 'absolute',
        }
        return (
          <div ref={this.renderPageRef} style={renderPageStyle}>
              <div style={{ display: this.prePageCanvas ? 'inherit' : 'none' }}>
                  <canvas ref={this.canvasRef}/>
                  {/*< div className='test'>TODO:</div>*/}
              </div>
              <div className='loadingStyle'
                   style={{ display: this.prePageCanvas ? 'none' : 'inherit' }}>加载中。。。。。。。。。。。。。。。。。。。
              </div>
          </div>
        )
    }
}
