import { useEffect, useState } from 'react'
import './App.css'

const LOGIN_API = 'https://dummyjson.com/auth/login'
const USERS_API = 'https://dummyjson.com/users?limit=30&select=username,password'

function App() {
  const [credentials, setCredentials] = useState({ username: 'miar', password: 'miarpass' })
  const [testUsers, setTestUsers] = useState([])
  const [testUsersError, setTestUsersError] = useState('')
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      setTestUsersError('')
      try {
        const response = await fetch(USERS_API)
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'User list olishda xatolik.')
        }

        const list = (data.users || []).map((user) => ({
          username: user.username,
          password: user.password,
        }))

        setTestUsers(list)
        console.log('DummyJSON user credentials:')
        console.table(list)
      } catch (fetchError) {
        setTestUsersError(fetchError.message || 'User list olinmadi.')
        console.error('User list olinmadi:', fetchError.message)
      }
    }

    loadUsers()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setProfile(null)

    const username = credentials.username.trim()
    const password = credentials.password.trim()

    if (!username || !password) {
      setError('Username va password kiriting.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          expiresInMins: 30,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.message === 'Invalid credentials') {
          throw new Error('Login xato. To‘g‘ri test login: miar / miarpass')
        }
        throw new Error(data.message || 'Login xatoligi yuz berdi.')
      }

      const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ')
      setProfile({
        image: data.image,
        fullName: fullName || data.username,
        email: data.email,
        username: data.username ?? username,
        password,
      })
    } catch (requestError) {
      setError(requestError.message || 'Server bilan ulanishda xatolik.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app">
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="input"
          type="text"
          name="username"
          placeholder="username"
          value={credentials.username}
          onChange={handleChange}
          autoComplete="username"
        />
        <input
          className="input"
          type="password"
          name="password"
          placeholder="password"
          value={credentials.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
        <button className="submit-btn" type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      <section className="test-logins">
        <p className="hint">Test login:</p>
        {testUsersError ? <p className="message message-error">{testUsersError}</p> : null}
        {testUsers.length > 0 ? (
          <div className="test-table-wrap">
            <table className="test-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Password</th>
                </tr>
              </thead>
              <tbody>
                {testUsers.map((user) => (
                  <tr key={user.username}>
                    <td>{user.username}</td>
                    <td>{user.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      {error ? <p className="message message-error">{error}</p> : null}

      {profile ? (
        <section className="profile-card">
          <div className="avatar-frame">
            <img src={profile.image} alt={profile.fullName} className="avatar" />
          </div>
          <p className="profile-name">{profile.fullName}</p>
          <p className="profile-text">{profile.email}</p>
          <p className="profile-text">
            Username: <span>{profile.username}</span>
          </p>
          <p className="profile-text">
            Password: <span>{profile.password}</span>
          </p>
        </section>
      ) : null}
    </main>
  )
}

export default App
