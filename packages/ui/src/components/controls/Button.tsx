import clsx from 'clsx';
import type {JSX} from 'preact';
import styles from './Controls.module.scss';

export interface ButtonProps
  extends Omit<JSX.HTMLAttributes<HTMLButtonElement>, 'loading' | 'type'> {
  main?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  value?: string;
}

export function Button({main, loading, className, ...props}: ButtonProps) {
  return (
    <button
      className={clsx(
        styles.button,
        className,
        main && styles.main,
        loading && 'loading',
      )}
      onMouseUp={event => (event.target as HTMLButtonElement).blur()}
      type={'button'}
      {...props}
    />
  );
}
