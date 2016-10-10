import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    is_connected: false,
    port: null,
}



const mutations = {
    UPDATE_ROBOT_CONNECTION (state, payload) {
        state.is_connected = payload.is_connected
        state.port = payload.port
    },
}

const actions = {
    connect_robot ({ commit }, port) {
        const payload = {is_connected: true, 'port': port}
        let options = {params: {'port': port}}
        Vue.http
            .get('http://localhost:5000/robot/serial/connect', options)
            .then((response) => {
                console.log('successfully connected...')
                console.log('committing with payload:', payload)
                commit('UPDATE_ROBOT_CONNECTION', payload)
            }, (response) => {
                console.log('failed to connect', response)
            })
    },
    is_connected ({ commit }) {
        this.$http
            .get('http://localhost:5000/robot/serial/is_connected')
            .then((response) => {
                console.log(response)
                if (response.data.is_connected === true){
                    console.log('successfully connected...')
                } else {
                    console.log('Failed to connect', response.data)
                }
                commit(
                    'UPDATE_ROBOT_CONNECTION',
                    {'is_connected': response.data.is_connected, 'port': response.data.port}
                )
            }, (response) => {
                console.log('Failed to communicate to backend server. Failed to connect', response)
                commit('UPDATE_ROBOT_CONNECTION', {'is_connected': false, 'port': null})
            })
    },
    disconnect_robot () {
        this.$http
            .get('http://localhost:5000/robot/serial/disconnect')
            .then((response) => {
                console.log(response)
                if (response.data.is_connected === true){
                    console.log('successfully connected...')
                } else {
                    console.log('Failed to connect', response.data)
                }
                commit(
                    'UPDATE_ROBOT_CONNECTION',
                    {'is_connected': false, 'port': null}
                )
            }, (response) => {
                console.log('Failed to communicate to backend server. Failed to connect', response)
            })
    }
}

export default new Vuex.Store({
    state,
    actions,
    mutations
})