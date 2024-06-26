import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from 'axios'
import { Header } from '../components/Header'
import { url } from '../const'
import './home.scss'

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo') // todo->未完了 done->完了
  const [lists, setLists] = useState([])
  const [selectListId, setSelectListId] = useState()
  const [tasks, setTasks] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [cookies] = useCookies()

  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value)

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data)
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`)
      })
  }, [cookies.token])

  useEffect(() => {
    const listId = lists[0]?.id
    if (typeof listId !== 'undefined') {
      setSelectListId(listId)
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks)
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`)
        })
    }
  }, [cookies.token, lists])

  const handleSelectList = (id) => {
    setSelectListId(id)
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks)
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`)
      })
  }

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list) => {
              const isActive = list.id === selectListId
              return (
                <li
                  key={list.id}
                  className={`list-tab-item ${isActive ? 'active' : ''}`}
                  tabIndex="0"
                  aria-selected={isActive}
                  role="tab"
                  onClick={() => handleSelectList(list.id)}
                >
                  {list.title}
                </li>
              )
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props

  const formatDateToDatetimeLocal = (isoString) => {
    const localDate = new Date(isoString)
    localDate.setHours(localDate.getHours() + 9)
    return localDate.toISOString().slice(0, 16).replace('T', ' ')
  }

  const getRemainingTimeMessage = (isoString) => {
    const targetDate = new Date(isoString)
    targetDate.setHours(targetDate.getHours() + 9)
    const currentDate = new Date()
    currentDate.setHours(currentDate.getHours() + 9)
    // 過去の日時かどうかをチェック
    if (targetDate < currentDate) {
      return '時間切れ'
    }
    const diffTime = Math.abs(targetDate - currentDate)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime / (1000 * 60 * 60)) % 24)
    const diffMinutes = Math.floor((diffTime / (1000 * 60)) % 60)
    if (diffDays > 0) {
      return `${diffDays} 日と${diffHours} 時間${diffMinutes} 分`
    } else if (diffHours > 0) {
      return `${diffHours} 時間${diffMinutes} 分`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} 分`
    } else {
      return '1 分未満'
    }
  }

  if (tasks === null) return <></>

  if (isDoneDisplay === 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true
          })
          .map((task, key) => (
            <li key={task.id} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'} ：残り
                {getRemainingTimeMessage(task.limit)} - 期限：
                {formatDateToDatetimeLocal(task.limit)}
              </Link>
            </li>
          ))}
      </ul>
    )
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false
        })
        .map((task, key) => (
          <li key={task.id} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? '完了' : '未完了'} ：残り
              {getRemainingTimeMessage(task.limit)} - 期限：
              {formatDateToDatetimeLocal(task.limit)}
            </Link>
          </li>
        ))}
    </ul>
  )
}

export default Home
