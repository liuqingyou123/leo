import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class Index extends Component {

  constructor() {
    super()
    this.state.arr = [1, 2, 6]
  }

  config = {
    navigationBarTitleText: '首页'
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    
    return (
      <View className='index'>
        {
          this.state.arr.map(item => (
            <View key={item}>{item}</View>
          ))
        }
        <Text>Hello world!</Text>
      </View>
    )
  }
}
