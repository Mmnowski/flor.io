import { type ReactNode, createContext, useContext } from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

interface ModalContextValue {
  isOpen: boolean;
  onClose: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Get modal context for compound component usage
 * @throws Error if used outside Modal component
 */
function useModalContext(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal compound components must be used within Modal');
  }
  return context;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Root Modal component for compound component pattern
 * Provides context and dialog wrapper
 *
 * @example
 * <Modal isOpen={isOpen} onClose={handleClose}>
 *   <Modal.Header>
 *     <h2>Delete Item</h2>
 *   </Modal.Header>
 *   <Modal.Body>
 *     <p>Are you sure?</p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleConfirm}>Delete</Button>
 *   </Modal.Footer>
 * </Modal>
 */
export function Modal({ isOpen, onClose, children }: ModalProps): React.ReactNode {
  return (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {children}
      </Dialog>
    </ModalContext.Provider>
  );
}

/**
 * Modal header compound component
 */
Modal.Header = function ModalHeader({ children }: { children: ReactNode }): React.ReactNode {
  return <DialogHeader>{children}</DialogHeader>;
};

/**
 * Modal title compound component
 */
Modal.Title = function ModalTitle({ children }: { children: ReactNode }): React.ReactNode {
  return <DialogTitle>{children}</DialogTitle>;
};

/**
 * Modal body compound component for content
 */
Modal.Body = function ModalBody({ children }: { children: ReactNode }): React.ReactNode {
  return <DialogContent>{children}</DialogContent>;
};

/**
 * Modal footer compound component for actions
 */
Modal.Footer = function ModalFooter({ children }: { children: ReactNode }): React.ReactNode {
  return <DialogFooter>{children}</DialogFooter>;
};

/**
 * Modal close button that uses context
 * Automatically closes modal when clicked
 */
Modal.CloseButton = function ModalCloseButton({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  const { onClose } = useModalContext();
  return <button onClick={onClose}>{children}</button>;
};
