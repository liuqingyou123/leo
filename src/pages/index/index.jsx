import Leo, { Component } from '@leojs/leo'
import { View, Text } from '@leojs/components'
import './index.css'

export default class Index extends Component {

  constructor() {
    super()
    this.state = {
      status: 1
    }
  }

  config = {
    navigationBarTitleText: '首页'
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  handleClick() {
    this.setState({
      status: this.state.status + 1
    })
    console.log('click')
  }

  render () {
    
    return (
      <View className='container'>
        <Text onClick={this.handleClick}>Hello world!</Text>
        { this.state.status }
      </View>
    )
  }
}
