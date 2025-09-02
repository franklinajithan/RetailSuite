import { InputHTMLAttributes } from 'react'
import clsx from 'clsx'
export default function Input(props: InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={clsx('input', props.className)} />
}