import type {JSX} from 'preact';
import styles from './Controls.module.scss';

export interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  value?: string | number;
  readOnly?: boolean;
}

export function Input({onChange, onChangeCapture, ...props}: InputProps) {
  return (
    <input
      onChangeCapture={onChangeCapture ?? onChange}
      onChange={onChangeCapture ? onChange : undefined}
      className={styles.input}
      {...props}
    />
  );
}
