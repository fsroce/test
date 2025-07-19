function myFunction (val, value) {
  if (!!val) {
    console.log('val:', true)
  } else {
    console.log('val:', false)
  }
  if (!value) {
    console.log('value:', false)
  } else {
    console.log('value:', true)
  }
}

myFunction(false, false)

