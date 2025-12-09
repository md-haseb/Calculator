

export function classifyValue(newValue){
  if (/^(log)□$/.test(newValue)) {
    return {type: 'logWithBox', value: newValue}
  }
  if (/^(log|ln|sin|cos|tan)$/.test(newValue)) {
    return {type: 'function', value: newValue}
  }
  if (/^(x)□$/.test(newValue)) {
    return {type: 'baseWithBox', value: newValue}
  }
  if (/^x[2-3]$/.test(newValue)) {
    return {type: 'baseWithSupers', value: newValue}
  }
  if (/^□√$/.test(newValue)) {
    return {type: 'boxWithRoot', value: newValue}
  }
  if (/^□C□$/.test(newValue) || /^□P□$/.test(newValue)) {
    return {type: 'CombAndPermBox', value: newValue}
  }
}