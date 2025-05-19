import axios from "axios"
import { constant } from "../constant"


export const postApi = async (path, data, login) => {
    try {
        console.log("constant.baseUr", constant.baseUrl)
        let result = await axios.post('http://localhost:5001/' + path, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
            }
        })
        if (result.data?.token && result.data?.token !== null) {
            if (login) {
                localStorage.setItem('token', result.data?.token)
            } else {
                sessionStorage.setItem('token', result.data?.token)
            }
            localStorage.setItem('user', JSON.stringify(result.data?.user))
        }
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}
export const putApi = async (path, data, id) => {
    try {
        let result = await axios.put('http://localhost:5001/'+ path, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
            }
        })
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}

export const deleteApi = async (path, param) => {
    try {
        let result = await axios.delete('http://localhost:5001/' + path + param, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
            }
        })
        if (result.data?.token && result.data?.token !== null) {
            localStorage.setItem('token', result.data?.token)
        }
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}

export const deleteManyApi = async (path, data) => {
    try {
        let result = await axios.post('http://localhost:5001/' + path, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
            }
        })
        if (result.data?.token && result.data?.token !== null) {
            localStorage.setItem('token', result.data?.token)
        }
        return result
    } catch (e) {
        console.error(e)
        return e
    }
}

export const getApi = async (path, id) => {
    try {
        if (id) {
            let result = await axios.get('http://localhost:5001/' + path + id, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
                }
            })
            return result
        }
        else {
            let result = await axios.get('http://localhost:5001/' + path, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || sessionStorage.getItem("token")}`
                }
            })
            return result
        }
    } catch (e) {
        console.error(e)
        return e
    }
}

