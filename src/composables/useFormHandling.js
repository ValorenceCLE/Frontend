import { ref, reactive, computed, watch } from 'vue';

/**
 * Composable for handling form state, validation and submission
 * @param {Object} options - Configuration options
 * @param {Object} options.initialData - Initial form data
 * @param {Function} options.onSubmit - Submit handler function that returns a Promise
 * @param {Function} options.validate - Optional validation function
 * @param {Boolean} options.resetAfterSubmit - Whether to reset form after successful submission
 * @param {Function} options.onSuccess - Optional callback after successful submission
 * @param {Function} options.onError - Optional callback after submission error
 * @returns {Object} Form handling utilities
 */
export function useFormHandling(options) {
  const {
    initialData,
    onSubmit,
    validate = () => ({ valid: true }), 
    resetAfterSubmit = false,
    onSuccess = () => {},
    onError = () => {},
  } = options;
  
  // Create reactive form state
  const formData = reactive({ ...initialData });
  
  // Backup for reset functionality
  const backupData = { ...initialData };
  
  // Form status
  const isSubmitting = ref(false);
  const submitError = ref(null);
  const submitSuccess = ref(false);
  const validationErrors = ref({});
  const touched = ref({});
  
  // Track if form has been modified
  const isDirty = computed(() => {
    return Object.keys(initialData).some(key => {
      // Handle different data types appropriately
      if (typeof initialData[key] === 'object' && initialData[key] !== null) {
        return JSON.stringify(initialData[key]) !== JSON.stringify(formData[key]);
      }
      return initialData[key] !== formData[key];
    });
  });
  
  // Mark a field as touched when edited
  const markTouched = (field) => {
    touched.value[field] = true;
  };
  
  // Reset form to initial data
  const resetForm = () => {
    // Reset each property to avoid losing reactivity
    Object.keys(formData).forEach(key => {
      if (typeof backupData[key] === 'object' && backupData[key] !== null) {
        formData[key] = JSON.parse(JSON.stringify(backupData[key]));
      } else {
        formData[key] = backupData[key];
      }
    });
    
    // Clear form status
    validationErrors.value = {};
    touched.value = {};
    submitError.value = null;
    submitSuccess.value = false;
  };
  
  // Update the backup when initialData changes
  watch(() => initialData, (newData) => {
    Object.assign(backupData, JSON.parse(JSON.stringify(newData)));
    // Only update formData if it hasn't been modified
    if (!isDirty.value) {
      resetForm();
    }
  }, { deep: true });
  
  // Handle form submission
  const submitForm = async () => {
    submitError.value = null;
    submitSuccess.value = false;
    
    // Run validation
    const validation = validate(formData);
    if (!validation.valid) {
      validationErrors.value = validation.errors || {};
      return false;
    }
    
    validationErrors.value = {};
    isSubmitting.value = true;
    
    try {
      // Call the submit handler with a copy of the form data
      const result = await onSubmit({ ...formData });
      
      // Update the backup data on success to match current state
      Object.assign(backupData, JSON.parse(JSON.stringify(formData)));
      
      submitSuccess.value = true;
      onSuccess(result);
      
      // Reset form if configured to do so
      if (resetAfterSubmit) {
        resetForm();
      }
      
      return true;
    } catch (error) {
      submitError.value = error.message || 'An error occurred during submission';
      onError(error);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  };
  
  return {
    formData,
    isSubmitting,
    submitError,
    submitSuccess,
    validationErrors,
    touched,
    isDirty,
    submitForm,
    resetForm,
    markTouched
  };
}