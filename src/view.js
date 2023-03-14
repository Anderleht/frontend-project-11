import onChange from 'on-change';
const renderErrors = (element, error, i18nInstance) => {
  if (element.nextElementSibling) {
    element.nextElementSibling.remove();
  }
  element.classList.remove('is-invalid');
  if (error) {
    console.log(element);
    element.classList.add('is-invalid');
    const feedback = document.createElement('p');
    feedback.classList.add('invalid-feedback');
    feedback.textContent = i18nInstance.t(error);
    element.after(feedback);
  }
};

export default (state, elements, i18nInstance) => {
  const watchedState = onChange(state, (processState, value) => {
    console.log(value, 'elements', processState, 'process');
    switch (processState) {
      case 'form.processError':
        renderErrors(elements.input, watchedState.form.processError, i18nInstance);
        break;

      default:
        throw new Error(`Unknown process state: ${processState}`);
    }
  });
  return watchedState;
};