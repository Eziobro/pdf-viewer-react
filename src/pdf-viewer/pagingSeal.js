import React, { Component } from 'react'
import { DIRECTION, getPixelRatio } from './utils'
import './index.css'

import avatar from '../static/avatar.jpg'

export default class PagingSeal extends Component {
    constructor (props) {
        super(props)
        this.canvasRef = React.createRef()
        this.pagingSealRef = React.createRef()
        let position = {}
        switch (props.sealData.direction) {
            case DIRECTION.RIGHT:
                position.left = props.pdfData.docWidth - props.sealData.width
                position.top = props.sealData.offset
                break
            case DIRECTION.LEFT:
                position.left = 0
                position.top = props.sealData.offset
                break
            case DIRECTION.TOP:
                position.left = props.sealData.offset
                position.top = 0
                break
            case DIRECTION.BOTTOM:
                position.left = props.sealData.offset
                position.top = props.pdfData.docHeight - props.sealData.height
                break
        }
        this.state = {
            position
        }
    }

    componentDidMount () {
        this.drawImage()
        this.pagingSealRef.current.addEventListener('mousedown', this.onMouseStart, { passive: false })
    }

    onMouseStart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const { sealData: { setOffset, height, width, direction }, pdfData: { docHeight, docWidth } } = this.props
        const pagingSealRef = this.pagingSealRef.current
        const startSealX = parseFloat(pagingSealRef.style.left)
        const startSealY = parseFloat(pagingSealRef.style.top)
        const startMouseX = e.pageX
        const startMouseY = e.pageY

        const onMouseMove = (e) => {
            e.preventDefault()
            const moveMouseX = e.pageX
            const moveMouseY = e.pageY
            let moveSealY = startSealY + moveMouseY - startMouseY
            let moveSealX = startSealX + moveMouseX - startMouseX
            if (direction === DIRECTION.RIGHT || direction === DIRECTION.LEFT) {
                if (moveSealY < 0) moveSealY = 0
                if (moveSealY > docHeight - height) moveSealY = docHeight - height
                pagingSealRef.style.top = moveSealY + 'px'
            } else if (direction === DIRECTION.TOP || direction === DIRECTION.BOTTOM) {
                if (moveSealX < 0) moveSealX = 0
                if (moveSealX > docWidth - width) moveSealX = docWidth - width
                pagingSealRef.style.left = moveSealX + 'px'
            }
        }

        const onMouseEnd = (e) => {
            const { left, top } = pagingSealRef.style
            const endSealX = parseFloat(left)
            const endSealY = parseFloat(top)
            const offset = endSealX - startSealX || endSealY - startSealY
            this.setState({
                position: {
                    top: endSealY,
                    left: endSealX
                }
            })
            if (offset === 0) {
                this.props.onChangePagingSealStatus(false)
            } else {
                this.props.onUpdateSeal(Object.assign(this.props.sealData, { offset }))
            }
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseEnd)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseEnd)
    }

    // shouldComponentUpdate (nextProps, nextState, nextContext) {
    //     return false
    // }

    drawImage = () => {
        const { sealData, docId, pageNum, pageTotal } = this.props
        const { offset, width: sealDataWidth, height: sealDataHeight } = sealData
        const cutWidth = sealData.width / pageTotal
        const canvasRef = this.canvasRef.current

        const ctx = canvasRef.getContext('2d')

        /**
         * 处理图形渲染出现锯齿
         */
        const ratio = getPixelRatio(ctx)
        canvasRef.style.width = canvasRef.width + 'px'
        canvasRef.style.height = canvasRef.height + 'px'
        canvasRef.width = canvasRef.width * ratio
        canvasRef.height = canvasRef.height * ratio
        // 放大倍数
        ctx.scale(ratio, ratio)

        const img = new Image()
        img.src = avatar
        img.onload = () => {
            /**
             * 对骑缝章进行偏移显示
             */
            ctx.drawImage(
              img,
              0,
              offset,
              sealDataWidth,
              sealDataHeight
            )
        }
    }

    render () {
        const { sealData } = this.props
        const { width, height, direction } = sealData
        const { position } = this.state
        const sealStyle = {
            ...position
        }
        return (
          <div ref={this.pagingSealRef} className='pagingSeal' style={sealStyle}
          >
              <canvas ref={this.canvasRef} width={width} height={height}></canvas>
          </div>
        )
    }
}
