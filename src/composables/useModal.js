import { ref, computed } from 'vue';

/**
 * Composable for managing modal state and actions
 * @param {Object} options - Configuration options
 * @param {Boolean} options.initialState - Initial visibility state (default: false)
 * @param {Function} options.onOpen - Optional callback when modal opens
 * @param {Function} options.onClose - Optional callback when modal closes
 * @param {Boolean} options.closeOnEscape - Whether to close on Escape key (default: true)
 * @param {Boolean} options.closeOnOutsideClick - Whether to close on outside click (default: true)
 * @returns {Object} Modal state and control functions
 */
export function useModal(options = {}) {
  const {
    initialState = false,
    onOpen = () => {},
    onClose = () => {},
    closeOnEscape = true,
    closeOnOutsideClick = true,
  } = options;

  // Modal state
  const isOpen = ref(initialState);
  const modalData = ref(null);
  
  // Tracking which element was focused before opening the modal
  // This allows restoring focus when the modal closes for accessibility
  let previouslyFocusedElement = null;
  
  // Open the modal, optionally with data
  const open = (data = null) => {
    if (!isOpen.value) {
      // Store the currently focused element
      previouslyFocusedElement = document.activeElement;
      
      isOpen.value = true;
      modalData.value = data;
      
      // Call the onOpen callback
      onOpen(data);
      
      // Set up event listeners
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
      }
    }
  };
  
  // Close the modal
  const close = () => {
    if (isOpen.value) {
      isOpen.value = false;
      
      // Call the onClose callback
      onClose(modalData.value);
      
      // Clean up event listeners
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscapeKey);
      }
      
      // Restore focus to the element that was focused before opening the modal
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
      }
    }
  };
  
  // Toggle the modal state
  const toggle = (data = null) => {
    isOpen.value ? close() : open(data);
  };
  
  // Handle click events - used for detecting outside clicks
  const handleOutsideClick = (event) => {
    if (closeOnOutsideClick && isOpen.value) {
      close();
    }
  };
  
  // Handle ESC key for closing the modal
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape' && isOpen.value) {
      close();
    }
  };
  
  // Properties for using in templates and v-model
  const modalProps = computed(() => ({
    modelValue: isOpen.value,
    'onUpdate:modelValue': (value) => {
      isOpen.value = value;
      if (!value) close();
    }
  }));
  
  return {
    isOpen,
    modalData,
    open,
    close,
    toggle,
    handleOutsideClick,
    modalProps
  };
}