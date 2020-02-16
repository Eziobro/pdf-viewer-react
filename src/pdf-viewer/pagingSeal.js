import React, { Component } from 'react'
import { getPixelRatio } from './utils'
import './index.css'

import avatar from '../static/avatar.jpg'

export default class PagingSeal extends Component {
    constructor (props) {
        super(props)
        this.canvasRef = React.createRef()
        let position = {}
        switch (props.sealData.direction) {
            case 'RIGHT':
                position.right = 0
                break
            case 'LEFT':
                position.left = 0
                break
            case 'TOP':
                position.top = 0
                break
            case 'BOTTOM':
                position.bottom = 0
                break
        }
        this.state = {
            position
        }
    }

    drawImage = () => {
        const { sealData, docId, pageNum, pageTotal } = this.props
        const { offset, width: sealDataWidth, height: sealDataHeight } = sealData
        const cutWidth = sealData.width / pageTotal
        const canvasRef = this.canvasRef.current

        // canvasRef.addEventListener('click', this.onClickCanvas, { passive: false });

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
              cutWidth * (pageTotal - pageNum - 1),
              offset,
              sealDataWidth,
              sealDataHeight
            )
        }

        /**
         * 对多余显示的骑缝章进行裁剪
         */
        ctx.rect(
          cutWidth * (pageTotal - 1),
          0,
          sealData.width,
          canvasRef.height
        )
        ctx.clip()
    }

    componentDidMount () {
        this.drawImage()
    }

    shouldComponentUpdate (nextProps, nextState, nextContext) {
        console.log(this.props)
    }

    render () {
        const { sealData } = this.props
        const { width, height, direction } = sealData
        const { position } = this.state
        const sealStyle = {
            ...position
        }
        return (
          <div className='pagingSeal' style={sealStyle}>
              <canvas ref={this.canvasRef} width={width} height={height}></canvas>
          </div>
        )
    }
}
