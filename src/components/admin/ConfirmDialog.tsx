import Modal from './Modal'

export type ConfirmDialogVariant = 'primary' | 'warning' | 'danger'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const confirmStyles: Record<ConfirmDialogVariant, string> = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      titleId="confirm-dialog-title"
      descriptionId="confirm-dialog-description"
      className="p-6 sm:p-7"
      closeOnBackdrop={!isLoading}
      showCloseButton={!isLoading}
    >
      <h2
        className="pe-10 text-lg font-semibold text-gray-900 dark:text-white"
        id="confirm-dialog-title"
      >
        {title}
      </h2>
      <p
        className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600 dark:text-gray-300"
        id="confirm-dialog-description"
      >
        {message}
      </p>
      <div className="mt-7 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-white/5"
          disabled={isLoading}
          onClick={onCancel}
          type="button"
        >
          {cancelLabel}
        </button>
        <button
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${confirmStyles[variant]}`}
          disabled={isLoading}
          onClick={onConfirm}
          type="button"
        >
          {isLoading ? 'Traitement…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
