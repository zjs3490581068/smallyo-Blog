---
title: "Python数据分析-numpy_function"
categories: Study
tags: ['Python']
id: "04fb78fc1274d76e"
date: 2025-11-30 21:45:22
cover: "https://zycs-img-2lg.pages.dev/v2/onznI6L.jpeg"
---

# 1.基本数学函数


```python
import numpy as np
```


```python
# 计算平方根
print(np.sqrt(9))
print(np.sqrt([1,4,9])) # 默认返回浮点数
arr = [1,25,64]
print(np.sqrt(arr))
```

    3.0
    [1. 2. 3.]
    [1. 5. 8.]



```python
# 计算指数
print(np.exp(1)) # e的1次方
```

    2.718281828459045



```python
# 计算自然对数
print(np.log(2.71)) # ln(e)
```

    0.9969486348916096



```python
# 计算正弦值、余弦值
print(np.sin(1))
print(np.cos(np.pi))
```

    0.8414709848078965
    -1.0



```python
# 计算绝对值
arr = np.array([-1,1,-2,-3])
print(np.abs(arr))
```

    [1 1 2 3]



```python
# 计算a的b次幂
print(np.power(arr,3))
```

    [ -1   1  -8 -27]



```python
# 四舍五入
print(np.round([3.5,2.2,4.5])) # 四舍五入，但是0.5向偶数凑
```

    [4. 2. 4.]



```python
# 向上取整，向下取整
arr = np.array([1.5,2.1,4.5,])
print(np.ceil(arr))
print(np.floor(arr))
```

    [2. 3. 5.]
    [1. 2. 4.]



```python
# 检测缺失值NaN
np.isnan([1,2,np.nan,3])
```




    array([False, False,  True, False])



# 2.统计函数


```python
arr = np.random.randint(1,20,8)
print(arr)
```

    [10  4  9  9  6  4 17  5]



```python
# 求和
print(np.sum(arr))
```

    64



```python
# 计算平均值
print(np.mean(arr))
```

    8.0



```python
# 计算中位数
print(np.median(arr))
```

    7.5



```python
# 计算标准差和方差
print(np.var(arr)) # 方差
print(np.std(arr)) # 标准差
```

    16.5
    4.06201920231798



```python
# 计算最大值和最小值
print(np.max(arr),np.argmax(arr)) # agrmax用于把最大值的索引找出来
print(np.min(arr))
```

    17 6
    4



```python
# 分位数
print(np.percentile(arr,25))
```

    4.75



```python
# 累计和、累计积
print(np.cumsum(arr))
print(np.cumprod(arr))
```

    [10 14 23 32 38 42 59 64]
    [     10      40     360    3240   19440   77760 1321920 6609600]


# 3.比较函数


```python
# 是否大于
print(np.greater([3,4,5,6,7],4)) # 数组元素依次和4进行比较判断是否大于
# 是否小于
print(np.less([3,4,5,6,7],4))
# 是否等于
print(np.equal([3,4,5,6,7],4))
print(np.equal([3,4,5],[3,4,6]))
```

    [False False  True  True  True]
    [ True False False False False]
    [False  True False False False]
    [ True  True False]



```python
# 逻辑运算
print(np.logical_and([0,1],[1,1]))
print(np.logical_or([0,1],[1,1]))
print(np.logical_not([1,0]))
```

    [False  True]
    [ True  True]
    [False  True]



```python
# 检查元素是否至少一个元素为True
print(np.any([0,0,1,0]))
# 检查元素是否全部为True
print(np.all([0,0,1,0]))
```

    True
    False



```python
# 自定义条件
# print(np.where(条件，符合条件，不符合条件))
a = np.array([1,2,3,4,5])
print(np.where(a>3,a,0))
print(np.where(a<5,a,0))
# 用于分类
score = np.random.randint(0,100,20)
print(score)
print(np.where(score<60,'不及格',np.where(
    score<80,'良好','优秀'
)
              ))

# 替代
print(np.select([score>=80,(score>=60)&(score<80),score<60],['优秀','良好','不及格'],default='未知'))
```

    [0 0 0 4 5]
    [1 2 3 4 0]
    [30 21 27 73 94 15 33 13 44 83 59 20  5 97 73 28 81 28 43 49]
    ['不及格' '不及格' '不及格' '良好' '优秀' '不及格' '不及格' '不及格' '不及格' '优秀' '不及格' '不及格'
     '不及格' '优秀' '良好' '不及格' '优秀' '不及格' '不及格' '不及格']
    ['不及格' '不及格' '不及格' '良好' '优秀' '不及格' '不及格' '不及格' '不及格' '优秀' '不及格' '不及格'
     '不及格' '优秀' '良好' '不及格' '优秀' '不及格' '不及格' '不及格']


# 4.排序函数


```python
# 排序
np.random.seed(0)
arr1 = np.random.randint(1,100,20)
print(arr1)
arr1.sort() # 直接排序并改变arr
print(arr1)
np.random.seed(0)
arr2 = np.random.randint(1,100,20)
print(arr2)
print(np.sort(arr2)) # 不改变arr
print(np.argsort(arr2)) # 排序后的索引
```

    [45 48 65 68 68 10 84 22 37 88 71 89 89 13 59 66 40 88 47 89]
    [10 13 22 37 40 45 47 48 59 65 66 68 68 71 84 88 88 89 89 89]
    [45 48 65 68 68 10 84 22 37 88 71 89 89 13 59 66 40 88 47 89]
    [10 13 22 37 40 45 47 48 59 65 66 68 68 71 84 88 88 89 89 89]
    [ 5 13  7  8 16  0 18  1 14  2 15  3  4 10  6 17  9 11 12 19]



```python
# 去重函数
print(np.unique(arr2)) # 删除重复值的同时进行排序
```

    [10 13 22 37 40 45 47 48 59 65 66 68 71 84 88 89]


# 5.其他函数


```python
# 数组的拼接
arr1 = np.array([1,2,3])
arr2 = np.array([4,5,6])
print(np.concatenate((arr1,arr2))) # 注意要将需要拼接的数组放到一个括号里
```

    [1 2 3 4 5 6]



```python
# 数组的分割
print(np.split(arr,5)) #分成5份
print(np.split(arr,[6,12,18]))
```

    [array([10, 13, 22, 37]), array([40, 45, 47, 48]), array([59, 65, 66, 68]), array([68, 71, 84, 88]), array([88, 89, 89, 89])]
    [array([10, 13, 22, 37, 40, 45]), array([47, 48, 59, 65, 66, 68]), array([68, 71, 84, 88, 88, 89]), array([89, 89])]



```python
# 调整数组的形状
print(np.reshape(arr,[4,5]))
```

    [[10 13 22 37 40]
     [45 47 48 59 65]
     [66 68 68 71 84]
     [88 88 89 89 89]]

