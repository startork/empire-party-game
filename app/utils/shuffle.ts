export function shuffled<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index] as T
    copy[index] = copy[swapIndex] as T
    copy[swapIndex] = current
  }
  return copy
}

function sameOrder(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index])
}

export function twoOrders(items: readonly string[]): [string[], string[]] {
  const first = shuffled(items)
  if (items.length < 2)
    return [first, [...first]]

  let second = shuffled(items)
  for (let attempt = 0; attempt < 8 && sameOrder(first, second); attempt += 1)
    second = shuffled(items)

  if (sameOrder(first, second))
    second = [...first].reverse()

  return [first, second]
}
