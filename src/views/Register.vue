<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Create Account</h2>
      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label>Name</label>
          <input type="text" v-model="name" placeholder="Enter your name" required />
        </div>
        <div class="input-group">
          <label>Email</label>
          <input type="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <div class="input-group">
          <label>Password</label>
          <input type="password" v-model="password" placeholder="Enter your password" required />
        </div>
        <button type="submit" class="register-btn">Register</button>
        <p class="login-link">
          Already have an account? <router-link to="/login">Login here</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

const name = ref('')
const email = ref('')
const password = ref('')
const router = useRouter()
const toast = useToast()

const handleRegister = async () => {
  try {
    await api.post('/api/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value
    })
    
    toast.success('Registration successful! Please login.')
    router.push('/login')
  } catch (err) {
    console.error('Register error:', err.response?.data)
    toast.error(err.response?.data?.message || 'Registration failed')
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.register-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.register-btn:hover {
  background: #5a67d8;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>