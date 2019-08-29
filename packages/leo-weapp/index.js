class BaseComponent {
  setState(state) {
    this.setData(state)
  }
}

function createApp(AppClass) {

}

function createComponent(ComponentClass) {

}


module.exports = {
  Component: BaseComponent,
  createApp,
  createComponent
}
