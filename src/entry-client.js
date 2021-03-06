import Vue from 'vue'
import 'es6-promise/auto'
import { createApp } from '@/app'
// a global mixin that calls `asyncData` when a route component's params change
Vue.mixin({
  beforeRouteUpdate(to, from, next) {
    console.log('beforeRouteUpdate:---')
    const { asyncData } = this.$options
    if (asyncData) {
      asyncData({
        store: this.$store,
        route: to
      })
        .then(next)
        .catch(next)
    } else {
      next()
    }
  }
})
console.log('window.$cookies', window.$cookies.get('token'))
const { app, router, store } = createApp(window.$cookies.get('token'))

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
  console.log('**************store.state: ', store.state)
}
console.log('###############', router)
console.log('###############', router.app.$route)
router.beforeEach((to, from, next) => {
  console.log('beforeEach exect... store ', store.state.token)
  next()
})

router.onReady(() => {
  router.beforeResolve((to, from, next) => {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = prevMatched[i] !== c)
    })
    const asyncDataHooks = activated.map(c => c.asyncData).filter(_ => _)
    if (!asyncDataHooks.length) {
      return next()
    }
    Promise.all(asyncDataHooks.map(hook => hook({ store, route: to })))
      .then(() => {
        console.log('asyncDataHooks client')
        next()
      })
      .catch(next)
  })
  app.$mount('#app')
})
