const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector('[name=productId]').value;
  // https://github.com/expressjs/csurf#readme
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('.product-item');

  fetch('/admin/product/' + productId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf,
    },
  })
    .then(result => result.json())
    .then(data => {
      console.log('data', data);
      productElement.remove();
    })
    .catch(err => {
      console.error(err);
    })
};
