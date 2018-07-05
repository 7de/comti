/* import m_contacts from '../mocks/contact';
import m_history from '../mocks/history';
import m_reply from '../mocks/reply';*/
import global from './global'

import wepy from 'wepy'

export default {
  apiData : {
    host: 'https://www.comtti.net/',
    api: 'https://www.comtti.net/weChat/',
    receiving: false, // 是否正在获取token
    token: '',
    userInfo: null,
    code: null
  },
  _login() {
    let {
      code,
      userInfo
    } = this.$parent
    return new Promise((resolve, reject) => {
      if (code && userInfo){
        resolve({
          code,
          userInfo
        })
      } else {
        wepy.login({
          success: res => {
            this.$parent.code = res.code
            wepy.showModal({
              title: '提示',
              content: '我们需要获得您的授权，才能进行下一步操作，请点击去授权',
              showCancel: false,
              confirmText: '去授权',
              success: function(res) {
                if (res.confirm) {
                  wepy.redirectTo({
                    url: './authorize'
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  _getToken() {
    const {
      api,
      token,
      receiving
    } = this.apiData
    return new Promise((resolve,reject) => {
      if (receiving) { // 请求中
        console.log('token请求中,等待1s后重新发送新的请求')
        setTimeout(() => {
          resolve(this._getToken())
        }, 1000)
      } else if (token) { // 如果缓存有token，直接获取缓存中的token
        resolve(token)
      } else {
        this.apiData.receiving = true
        this._login()
      }
    })

  },
    getUserInfo () {
    },

    // 获取用户标识
    getCode () {
      let _code = null
      wepy.getStorage({
        key: '_code',
        success: res => {
          _code = res.data
          console.log(_code)
        }
      })
      return _code
    },

    getStorage(key) {
      let _keydata = null
      wepy.getStorage({
        key: key,
        success: res => {
          _keydata = res.data
          // this.getKeyData(_keydata)
        }
      })
      console.log(_keydata)
    },
    getKeyData(data) {
      console.log(data)
      return data
    },
    /* // 获取storage
    getStorage(key,_data) {
      wepy.getStorage({
        key: key,
        success: function(res) {
          _data = res.data
          console.log(_data)
        } 
      })
    } */

    // left join contact c
    // on (h.from == c.id or h.to == c.id)
    // where h.from = :id or h.to = :id or :id = '';
    // order by h.time asc;
    /* getHistory (id) {
      let history = wepy.getStorageSync('_wechat_history_') || m_history;
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let sorted = history.sort((a, b) => a.time - b.time)
            if (!id)
                resolve(this.leftJoin(sorted, m_contacts))
            else {
                resolve(this.leftJoin(sorted.filter((v) => v.from === id || v.to === id), m_contacts));
            }
        })
      })
    }, */
    _token(){
        // let _keydata = null
      return new Promise((resolve, reject) => {
        wepy.getStorage({
          key: 'token',
          success: res => {
            resolve(res.data)
          }
        })
      })
    },
    _request(method, url, params, header = {}) {
      /* this._token().then( res => {
        // console.log(res)
        this.token = res
        console.log(this.token)
      }) */
      const {
        host
      } = this.apiData
      return new Promise((resolve, reject) => {
        wepy.request({
          url: `${host}${url}`,
          method: method,
          data: params,
          header: Object.assign({
            'content-type': 'application/json'
          }, header),
          success: res => {
            const {
              data
            } = res
            if (data.code === 500 || data.status === 500) {
              wepy.showToast({
                title: '服务器错误，请联系管理员',
                icon: 'none',
                duration: 2000
              })
              // resolve(this._request(method, url, params))
            } else if (data.code === -1) {
              wepy.showToast({
                title: data.msg ? data.msg : data.message,
                icon: 'none',
                duration: 2000
              })
            } else if (data.code === -100) {
              /* wepy.showToast({
                title: '授权过期',
                icon: 'none',
                duration: 2000
              }) */
              wepy.redirectTo({
                url: '/pages/authorize'
              })
            } else {
              resolve(data)
            }
          },
          fail: err => {
            console.log('请求失败：' + err)
          }
        })
      })
    },
    get(url, params = {}, header = {}) {
      return this._request('GET', url, params, header)
    },
    post(url, params = {}, header = {}) {
      return this._request('POST', url, params, header)
    },
    put(url, params = {}, header = {}) {
      return this._request('PUT', url, params, header)
    },
    delete(url, params = {}, header = {}) {
      return this._request('DELETE', url, params, header)
    },
    clearMsg (id) {
      return wepy.clearStorage()
    },
    // 毫秒转换成时分秒
    formatDuring (mss) {
      // var days = parseInt(mss / (1000 * 60 * 60 * 24));
      var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = parseInt((mss % (1000 * 60)) / 1000);
      // return days + " : " + hours + " : " + minutes + " : " + seconds;
      return  (hours < 10 ? '0' + hours : hours) + " : " + (minutes < 10 ? '0' + minutes : minutes) + " : " + (seconds < 10 ? '0' + seconds : seconds);
    },
    // 毫秒转分钟
    formatMin(time) {
      return parseInt((time % (1000 * 60 * 60)) / (1000));
    },
    // 时间戳转换时间
    formatDate (date, fmt) {
      if (/(y+)/.test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
      }
      let o = {
          'M+': date.getMonth() + 1,
          'd+': date.getDate(),
          'h+': date.getHours(),
          'm+': date.getMinutes(),
          's+': date.getSeconds()
      };
      for (let k in o) {
          if (new RegExp(`(${k})`).test(fmt)) {
              let str = o[k] + '';
              fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : this.padLeftZero(str));
          }
      }
      return fmt;
    },

    // 不足10，前加零
    padLeftZero (str) {
      return ('00' + str).substr(str.length);
    },

    // 小时转换毫秒
    // 1时(h)=3600000毫秒(ms)
    // 1分(min)=60000毫秒(ms)
    // 1秒(s)=1000毫秒(ms)
    formatMs(time) {
      return time * 3600000
    },
    // 时分秒计时器
    startTime(h,m,s) {
      let _h = h
      let _m = m
      let _s = s
      _h = this.checkTime(_h)
      _m = this.checkTime(_m)
      _s = this.checkTime(_s)
    },
    checkTime(i) {
      if (i<10) {i="0" + i}
      return i
    },

    // 金额默认以分为单位，若为整数后面自动补零
    // str 分单位金额
    fotmatMoney(str) {
      let _money = (str/100).toFixed(2);
      /* if (!/\./.test(_money)) { // 为整数字符串在末尾添加.00
        _money += '.00'
      } */
      return _money
    }

}