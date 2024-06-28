import React, { useEffect, useState } from 'react'
import { Header } from '../components/Header'
import axios from 'axios'
import { useCookies } from 'react-cookie'
import { url } from '../const'
import { useNavigate, useParams } from 'react-router-dom'
import './editTask.scss'

export const EditTask = () => {
  const navigate = useNavigate()
  const { listId, taskId } = useParams()
  const [cookies] = useCookies()
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [limit, setLimit] = useState('')
  const [isDone, setIsDone] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const handleTitleChange = (e) => setTitle(e.target.value)
  const handleDetailChange = (e) => setDetail(e.target.value)
  const handleLimitChange = (e) => {
    let value = e.target.value
    if (!value.endsWith(':00Z')) {
      value += ':00Z'
    }
    setLimit(value)
  }
  const handleIsDoneChange = (e) => setIsDone(e.target.value === 'done')

  const onUpdateTask = () => {
    const formattedLimit = new Date(limit)
    formattedLimit.setHours(formattedLimit.getHours() - 9)
    const isoDateLimit = formattedLimit.toISOString()

    console.log(isDone)
    const data = {
      title: title,
      detail: detail,
      limit: isoDateLimit,
      done: isDone,
    }

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res.data)
        navigate('/')
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`)
      })
  }

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate('/')
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`)
      })
  }

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data
        const localDate = new Date(task.limit)
        localDate.setHours(localDate.getHours() + 9)

        setTitle(task.title)
        setDetail(task.detail)
        setLimit(localDate.toISOString())
        setIsDone(task.done)
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`)
      })
  }, [cookies.token, listId, taskId])

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <label>期限</label>
          <br />
          <input
            type="datetime-local"
            onChange={handleLimitChange}
            className="edit-task-limit"
            value={limit.slice(0, 16)}
          />
          <br />
          <br />
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? 'checked' : ''}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? 'checked' : ''}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  )
}
