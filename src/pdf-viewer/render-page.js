import React, {Component} from "react";
import {PAGE_RENDER_STATUS, pageRender} from './pageRender'
import {getKey} from './utils'
import style from './index.less'

export default class RenderPage extends Component {
    constructor(props) {
        super(props);
        this.renderRef = React.createRef()
        this.pageRender = props.pageRender
    }

    componentDidMount() {
        console.log(this.props)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const {docId, currentPage} = this.pageRender
        return (
            <div ref={this.renderRef} key={getKey(docId, currentPage)}>
                {
                    this.pageRender.status !== PAGE_RENDER_STATUS.READY &&
                    <div className={style.loadingStyle}>loading.....</div>
                }
            </div>
        )
    }
}