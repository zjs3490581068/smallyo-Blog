---
title: "《StoryDiffusion》 论文精读"
categories: Papers
tags: ['深度学习','图像生成','扩散模型','图像一致性']
id: "papers-StoryDiffusion"
date: 2026-03-04 19:50:02
cover: "https://zycs-img-2lg.pages.dev/v2/5n8sl0q.png"
---

:::note{type="success"}
本篇是论文精读系列的第五篇。StoryDiffusion是非常经典的免训练方法。深入研读其核心公式（如 $V_i = \text{CrossAttention}(V_i, \text{concat}(T, P_i), \text{concat}(T, P_i))$），理解多张图片在计算注意力张量时是如何沿特定维度拼接的。
:::

# 前置知识与背景
## LDM
StoryDiffusion 是直接构建在 Stable Diffusion（SD 1.5 和 SD XL）之上的即插即用模块。
原始的 DDPM 是直接在原图的像素空间 $\mathbb{R}^{H \times W \times 3}$ 上预测噪声，计算量极大。[[《Scalable Diffusion Models with Transformers》论文精读#隐空间扩散模型（LDM）|LDM]] 的核心突破是引入了一个低维的潜空间表示 $z \in \mathbb{R}^{h \times w \times c}$ 中。所有的扩散过程都在这个极小、极密集的潜空间中完成，最后再由 VAE 的 Decoder 将潜变量还原为像素图像。这种降维使得模型可以在消费级显卡上运行。

## 交叉注意力
在 U-Net 中，文本提示词首先经过 CLIP Text Encoder 变成词嵌入向量。然后，U-Net 在其网络层中穿插了[[《Scalable Diffusion Models with Transformers》论文精读#交叉注意力|交叉注意力]]模块。在这里，图像的潜变量特征作为 Q，而文本嵌入作为 K 和 V。这使得图像在生成时 2 能够关注到文本的语义指导。

## PhotoMaker
PhotoMaker 是近期非常火的一种专门针对“身份保留（ID-Preservation）”的定制化生成技术，也是这篇论文重点对比的基线方法.
传统的人物定制方法（如 LoRA 或 DreamBooth）需要消耗显存和时间对 U-Net 的参数进行微调。PhotoMaker 采用了一种免微调 (Tuning-free) 的范式：不改模型权重，而是直接在文本输入端动手脚，创造一个极度富含人物特征的“超级词汇”。
### 核心机制 ：堆叠 ID 嵌入 (Stacked ID Embedding)
它的底层逻辑是将多张人物参考图压缩、融合，最后替换掉 Prompt 中的类别词。
#### 编码器与架构实现步骤
1. 双编码器特征提取：
    - Image Encoder： 使用预训练的视觉模型（如 CLIP ViT）分别提取出用户传入的 $N$ 张参考图的图像特征向量。
    - Text Encoder： 使用 CLIP Text Encoder 提取用户 Prompt 中类别词（如 "man"、"woman"）的文本特征向量。
2. 特征融合 (Fusion)： 单纯的图像特征缺乏语义方向。PhotoMaker 通过一个多层感知机 (MLP) 或交叉注意力机制，将“类别词文本特征”与“每一张照片的图像特征”进行融合，得到 $N$ 个既有精确长相、又有明确语义标签的融合向量。
3. 维度拼接与堆叠 (Stacking)：
    这是最核心的一步。 网络会将这 $N$ 个融合向量沿着序列长度 (Sequence Length) 维度首尾相接，拼接在一起。如果一个普通词汇的 Embedding 长度是 1，那么这个“堆叠 ID”的长度就是 $N$。 
4. 注入 U-Net 交叉注意力 (Cross-Attention)：
    系统会将用户 Prompt（如 "A photo of a [man] in a cyberpunk city"）中的 `[man]` 这个词的特征，强行替换为上面生成的超长 Stacked ID Embedding。
    当文本条件进入 U-Net 的 Cross-Attention 层时，模型会像对待普通句子一样去 Attention 这个 ID 序列。因为这个堆叠的序列中包含了同一人物多角度、多表情的极高密度特征，模型能够在不改变网络权重的情况下，直接“抄袭”这些面部细节，生成高保真的新图像。
    这就是为什么论文中提到，PhotoMaker 虽然擅长保脸，但因为它的特征是通过文本通道（Cross-Attention）注入的，这种全局性的特征广播很难精准控制局部的场景和衣服（Attires），进而给 StoryDiffusion 的自注意力（Self-Attention）魔改留下了施展空间。

## 视频扩散模型
StoryDiffusion 不仅生成一致性图片，还能将其转化为视频。
### 3D 卷积
- 2 D 卷积： 处理的是单张静态图像。它的输入张量形状通常是 `[Batch, Channel, Height, Width]`（对应 `nn.Conv2d`）。卷积核是一个二维矩阵，在图像的宽高平面上滑动，提取边缘、纹理等空间特征。
- 3 D 卷积： 引入了第三个维度：时间（Temporal）或帧数。输入张量的形状变成了 `[Batch, Channel, Time, Height, Width]`（对应 `nn.Conv3d`）。此时，卷积核变成了一个三维的“小立方体”。它不仅在画面的宽高上滑动，还在时间轴（连续的视频帧）上滑动。这意味着它可以同时捕捉到画面内的空间特征，以及物体在前后帧之间的运动轨迹（时间特征）。

### 视频扩散模型的演进
- 早期尝试（全 3D 架构）： 早期的视频扩散模型（如 VDM）非常直接，他们把图像 U-Net 里的 2D 卷积全部替换成 3D 卷积来实现视频生成。这在数学逻辑上很自然，但计算量和显存占用会呈指数级爆炸，极难训练。
- 主流解法（空时解耦）： 为了降低计算成本，后来的架构（如 MagicVideo、AnimateDiff，以及 StoryDiffusion 借鉴的预训练模块）采取了妥协策略。它们保留了 U-Net 原始的 2D 卷积和空间自注意力层（专门负责画质和空间结构），然后在这些层之后插入一维的时间注意力（Temporal Attention） 模块。这种解耦设计既利用了图像扩散模型的强大先验，又相对轻量地解决了帧间连贯性问题。
#### 时间注意力
在视频扩散模型（如 AnimateDiff）中，纯 3D 卷积会导致计算量呈指数级爆炸，且极难训练。时间注意力的核心思想是“空时解耦”（Spatial-Temporal Decoupling）：在原本只处理空间特征的 2D U-Net 中，硬插入一个专门处理时间（帧与帧之间）特征的 1D Transformer 模块。
理解时间注意力的关键在于数据在网络中传递时，形状（Shape）是如何重组的。假设当前特征图的形状为 $[B, C, F, H, W]$，即 [批次大小, 通道数, 帧数, 高度, 宽度]。
- 在空间自注意力 (Spatial Attention) 阶段： 张量会被 Reshape 为 $[(B \times F), (H \times W), C]$。此时，时间维度 $F$ 被折叠进了 Batch 中。模型会把它当成 $B \times F$ 张独立的单张图片，在每一帧内部的各个物理像素之间计算注意力，提取画面细节。
- 在时间注意力 (Temporal Attention) 阶段：
  张量会被重新排列（Permute/Reshape）为 $[(B \times H \times W), F, C]$。此时，空间维度被折叠成了 Batch。这意味着，模型是在跨越时间序列 F$，专门针对不同帧的同一个物理坐标计算相关性。比如，专门观察像素点 $(x, y)$ 从第 1 帧到第 16 帧的变化轨迹，从而确保运动的平滑和物理规律。
  **模块架构**：
  一个标准的时间注意力模块（如 AnimateDiff 中的 Motion Module）通常包含以下组件：
1. 输入与相对位置编码： 序列进入模块后，首先会被加上时间位置编码 (Temporal Positional Encoding)，告诉模型哪一帧在前、哪一帧在后。
2. 1 D Multi-Head Self-Attention： 沿着帧数 $F$ 维度进行标准的多头自注意力计算。
3. 残差连接 (Residual Connection)： 计算结果通过残差加回原始的网络流中（$Output = Input + Attention(Input)$）。
   在初始化阶段，时间注意力层最后的输出投影权重会被初始化为全零（Zero-initialization）。这意味着在未经训练时，它对原视频帧没有任何影响（完美退化回 Stable Diffusion 原本的图像生成状态），从而最大程度保留了预训练图像基座的强大画质先验。

---
# 研究背景与动机
## 现有方法的局限性
### 强引导导致的失控
[[《IP-Adapter》论文精读|IP-Adapter]] 通过提取参考图像的特征并作为条件注入模型，能很好地生成相似图像。但是，由于图像条件的引导力太强，会显著削弱用户通过文本提示词控制生成内容（如动作、场景）的能力。
虽然IP-Adapter 确实暴露了一个 scale 权重参数（即你提到的 $\lambda$）来控制图像特征的注入强度。但论文中提到的“引导力太强导致文本可控性降低” ，实际上是一个底层架构层面的特征冲突问题。
- 注入机制冲突： IP-Adapter 的核心设计是新增了一路交叉注意力层，将图像特征和文本特征一起作为条件注入到 U-Net 中。
- 特征密度的压制： 图像提取出的特征向量通常极其稠密，包含了大量低级的视觉细节；而文本特征相对稀疏且抽象。当它们共同在交叉注意力中竞争时，稠密的图像特征很容易“喧宾夺主”，掩盖掉文本原本的指令。
- 两难的 Trade-off： 如果你把 $\lambda$ 调低，文本的控制力（比如让人物“奔跑”或“喝水”）确实回来了，但参考图中人物的脸部细节和身份也就跟着模糊和丢失了。这是一个典型的零和博弈。

### 服装与场景的割裂
PhotoMaker，它专注于身份 (ID) 的控制。虽然脸长得一样，但它无法保证角色在不同图像中的服装 (attires) 和场景的连贯性，这对于“讲故事”来说是致命的缺陷。
论文指出，PhotoMaker 专注于控制人物身份，确实能保证脸部长得一样。但是，对于连环画或视频这种需要叙事的场景来说，它无法保证人物在第一张图和第二张图里的服装（Attire）和所处场景是一致的。可以参考论文图 4 中的园丁例子，PhotoMaker 生成的三张图虽然脸一样，但穿的工装裤细节和帽子款式完全变了。

### 视频过渡差
现有的过渡视频生成方法 (如 SEINE 和 SparseCtrl) 仅仅依赖图像潜空间中的时间网络来预测中间内容。论文指出，这种方法在处理角色大幅度运动等复杂过渡时表现很差 。

## 核心动机
论文的目标是寻找一种极其轻量级的方法，最好是零样本 (Zero-shot) 和免训练的。它既要保持人物身份和服装的绝对一致，又要最大化文本的控制力。
针对 IP-Adapter 的问题，StoryDiffusion 为了跳出这个困局，选择完全不去动交叉注意力（把条件控制权100%还给文本），而是去魔改原生的自注意力，让同一个 Batch 内的图片互相“参考”，从而在零样本的情况下既保持了身份一致，又没有削弱文本的控制力。
而PhotoMaker 虽然擅长保脸，但因为它的特征是通过文本通道（Cross-Attention）注入的，这种全局性的特征广播很难精准控制局部的场景和衣服（Attires），进而给 StoryDiffusion 的自注意力魔改留下了施展空间。

---
# 核心架构
论文通过两个极其优雅的模块，分别解决了一致性图像生成和过渡视频生成的问题。
## 一致性自注意力
在之前的工作中，U-Net 中的 Cross-Attention 负责文本控制，而 Self-Attention 负责图像内部的全局结构。StoryDiffusion 的作者非常巧妙地想到：如果在计算自注意力时，能让模型不仅只关注当前图片，还能与同批次（Batch）里的其他图片建立联系，就能保持一致性。
### Batch 图像
在传统的 DDPM 或标准的 Stable Diffusion 训练和推理中，Batch 里的图像确实是互相独立的，它们被打包在一起仅仅是为了吃满 GPU 的算力，做并行计算。
但在 StoryDiffusion 中，Batch 的语义被彻底改变了。
- 从“独立样本”变成了“故事序列”： 在生成时，StoryDiffusion 会将一个完整的故事文本拆分成多个提示词，并在同一个 Batch 中同时生成这些提示词对应的图像。也就是说，这个 Batch 里的图天生就是一组需要具备逻辑关联的连环画分镜。    
- 具体是如何实现关联的？ 核心机制就是通过修改 U-Net 中的自注意力层。在计算单张图片 $I_i$ 的自注意力时，模型会使用随机采样函数（RandSample）跨越 Batch 的限制，把 Batch 内其他图片（$I_1, I_2, ..., I_{i-1}, I_{i+1}, ..., I_B$）的特征提取出来一部分（即采样 Token $S_i$） 。然后，把这些从其他图片借来的 Token 和当前图片的 Token 拼在一起参与计算。这就强制打破了 Batch 内图像的独立性，让它们在生成过程中互相“参考”，从而实现了角色的长相和服装统一。
### 理论与公式推演
1. 传统的 Self-Attention： 对于单张图像的特征 $I_i$，原本是独立进行的，通过线性映射生成查询 $Q_i$、键 $K_i$ 和值 $V_i$ 。随后进行注意力计算：
   $$O_i = \text{Attention}(Q_i, K_i, V_i)$$
2. 引入外部参考 (Sampling)： Consistent Self-Attention 会从批次内的其他图像特征中随机采样一部分 token，记为 $S_i$ ：
   $$S_i = \text{RandSample}(I_1, I_2, ..., I_{i-1}, I_{i+1}, ..., I_B)$$
3. 特征拼接与计算： 将这些采样来的 $S_i$ 与当前图像的特征 $I_i$ 组合成新的集合 $P_i$ 。请注意这里的核心细节：原始的查询向量 $Q_i$ 保持不变**，只对组合后的 $P_i$ 进行线性映射得到新的键 $K_{Pi}$ 和值 $V_{Pi}$ 。然后进行全新的自注意力计算：
   $$O = \text{Attention}(Q_i, K_{Pi}, V_{Pi})$$
   这种跨图像的特征交互，能够促使模型在生成过程中收敛出一致的角色、面部和服装，而且完全不需要额外的训练。
>  线性映射
>  当我们把当前图像特征 $I_i$ 和其他图像采样来的 $S_i$ 拼接成新的集合 $P_i$ 后，确实需要对 $P_i$ 进行线性映射来生成键 $K_{Pi}$ 和值 $V_{Pi}$ 。但是，这里使用的线性映射权重（Q-K-V weights），完全是直接拿 Stable Diffusion 原本就训练好的权重来用的。所以说一致性注意力是免训练的。

### Algorithm 1 伪代码详解
```python
def ConsisentSelfAttention(images_features,sampling_rate,tile_size):
	"""
	images_token: [B, C, N]
	sampling_rate: Float (0-1)
	tile_size: Int
	"""
	output = zeros(B,N,C),count = zeros(B,N,C),W = tile_size
	for t in range(0,N - tile_size+1):
		# Use tile to override out of GPU memory
		tile_features = images_tokens[t:t + W,:,:]
		reshape_feature = tile_feature.reshape(1,W*N,C).repeat(W,1,1)
		sampled_tokens = RandSample(reshape_feature,rate=sampling_rate,dim=1)
		
		# Concat the tokens from  other images with the original tokens
		token_KV = concat([sampled_tokens,tile_features],dim=1)
		token_Q = tile_features
		
		# perform attention calculation:
		X_q,X_k,X_v = Linear_q(token_Q),Linear_k(token_KV),Linear_v(token_KV)
		output[t:t+W,:,:] += Attention(X_q,X_k,X_v)
		count[t:t+W,:,:] += 1
		
	output = output/count
	return output
```
首先，我们不得不质疑作者在这个伪代码里出现一个笔误：
作者定义了输入的维度：`images_tokens: [B, N, C]`。然后，作者写了那个切片操作：`tile_features = images_tokens[t:t+W, :, :]` 。这里的切片是发生在第一个维度（索引为 0 的维度）上，也就是Batch 维度 ($B$)。但作者写的循环条件：`for it in range(0, N - tile_size + 1): `  。他用代表单图 Token 数量的 $N$ 去减窗口大小，这在张量维度上是完全说不通的。结合论文正文中提到的“沿时间维度的滑动窗口”，这里正确的逻辑应该是：
`for t in range(0, B - tile_size + 1):`

认识到这个笔误之后，我们开始逐行解读。
1. 初始化与滑动窗口
``` python
output = zeros(B, N, C), count = zeros(B, N, C), W = tile_size
for t in range(0, B - W + 1): # 修正了原论文的 N 为 B
    tile_features = images_tokens[t:t + W, :, :]
```
-  假设我们生成一个 $B=10$ 张图的故事，窗口 $W=3$。第一轮循环（$t=0$），我们把第 1、2、3 张图的特征（`tile_features`，形状为 $[3, N, C]$）切出来 。第二轮（$t=1$），切第 2、3、4 张图。这就形成了重叠的滑动窗口。
2. 构建“共享特征池” (Pooling Features)
```python
    reshape_feature = tile_features.reshape(1, W*N, C).repeat(W, 1, 1)
```
- 这一步非常巧妙。模型先用 `.reshape(1, W*N, C)` 把这 $W$ 张图的所有 Token 全部倒进一个大池子里，摊平成一个超长的序列（长度为 $W \times N$）。
- 然后用 `.repeat(W, 1, 1)` 把这个大池子复制 $W$ 份。为什么？因为当前窗口里有 $W$ 张图，我们要保证这 $W$ 张图里的每一张，都能拿到一模一样的、包含了大家所有特征的完整大池子 。此时张量形状变成 $[W, W \times N, C]$。
3. 随机采样 (Random Sampling)
```python
    sampled_tokens = RandSample(reshape_feature, rate=sampling_rate, dim=1)
```
- 如果把所有图的特征全用来算 Attention，计算量太大了。所以在这个包含 $W \times N$ 个 Token 的池子里，我们按照 `sampling_rate`（比如 0.5）随机抽样一部分 Token 出来 。
- 这就相当于：第 1 张图不仅有自己的特征，还随机抽取了第 2 张和第 3 张图的一部分特征。
4. 组装 Q、 K、V 的原材料
```python
    token_KV = concat([sampled_tokens, tile_features], dim=1)
    token_Q = tile_features
```
- 这是点睛之笔。
- 对于查询 (Query)：`token_Q` 只用当前图片自己的特征（`tile_features`）。
- 对于键 (Key) 和值 (Value)：`token_KV` 把其他图的采样特征和当前图像的特征拼在了一起。
5. 免训练的注意力计算 (Training-Free Attention)
```python
    X_q, X_k, X_v = Linear_q(token_Q), Linear_k(token_KV), Linear_v(token_KV)
    output[t:t+W, :, :] += Attention(X_q, X_k, X_v)
    count[t:t+W, :, :] += 1
```
- 用 SD 模型原有的线性层权重（预训练好的），分别映射出 $Q, K, V$ 进行标准的自注意力计算 。
- 因为我们的窗口是重叠滑动的（步长为 1），同一张图（比如第 2 张图）会在多个窗口中被重复计算。所以需要用 `output` 把每次算出来的特征累加起来，并用 `count`  记录它到底被算了几次。   
6. 收尾平均
```python
output = output / count
return output
```
- 循环结束后，把累加的特征除以计算次数。这种重叠平均极其有效地平滑了不同窗口之间的特征差异，保证了整个长篇故事从头到尾的绝对一致。

## 语义运动预测器
生成了一系列具有一致性的静态图（例如连环画的分镜）后，作者又将它们转化为流畅的过渡视频。
### 现有的过渡视频生成方法与时间网络的局限
在探讨 StoryDiffusion 为什么要做改变之前，我们需要看看现有的基线模型是怎么做的。
- 代表性方法： 论文中主要对比了目前最前沿的两种过渡视频生成方法：SEINE 和 SparseCtrl 。SEINE 在训练时通过随机掩码视频序列，让模型学习预测两帧之间的过渡；而 SparseCtrl 则是引入了一个稀疏控制网络，使用稀疏控制数据来合成控制信息指导视频生成。   
- “潜空间的时间网络”： 这两个方法在预测中间帧时，完全依赖于图像潜空间中的时间网络。这种时间模块通常是 1D 的注意力机制，它是独立地在每个空间位置的像素上运行的。
- 致命痛点： 因为时间模块只盯着固定坐标点 $(x,y)$ 随着时间的变化，它在推断中间帧时对整体空间位置信息的考量是不充分的。这就导致它很难对长距离和具有物理意义的大幅度运动进行建模。比如人物从左边大跨步走到右边，原有的像素点直接做时间插值就会出现画面崩坏。

### 在“语义空间”预测运动
为了解决上述问题，StoryDiffusion 选择在更高级的“语义空间”而非“像素/潜空间”来规划运动轨迹。大体思路如下：
1. 特征编码 (Encoding)： 不直接使用线性层，而是利用预训练的 CLIP 图像编码器 ($E$)，将给定的起始帧 $F_s$ 和结束帧 $F_e$ 压缩到图像语义空间中，得到编码空间信息的向量 $K_s$ 和 $K_e$ 。
   $$K_s, K_e = E(F_s, F_e)$$
2. 运动预测： 在语义空间中，首先执行线性插值，将 $K_s$ 和 $K_e$ 扩展为长度为 $L$（所需视频长度）的序列 $K_1, K_2, ..., K_L$ 。随后，将该序列送入一系列 Transformer Block ($B$) 中预测过渡帧：
   $$P_1, P_2, ..., P_L = B(K_1, K_2, ..., K_L)$$
> 线性插值：
> 标准的线性插值（LERP）的数学计算公式如下：
> $$K_i = K_s + \frac{i-1}{L-1}(K_e - K_s)$$ 其中，$i$ 表示当前需要计算的中间帧索引（取值范围从 $1$ 到 $L$）。

> Transformer Block 的具体架构：
> 根据论文附录 B 的说明，这里的 Semantic Motion Predictor 包含了 8 个 Transformer 层，隐藏维度被设置为 1024，并配备了 12 个注意力头。它使用的图像特征提取器是 OpenCLIP ViT-H-14 预训练模型。
> 输入与输出维度（结合论文图 3）：
> - 初始输入： 首尾两帧经过 Image Encoder 后，提取出的维度表示为 $2 \times N \times C$ 。这里 $2$ 代表起始和结束两帧，$N$ 代表 ViT 模型切分出的图像 Token 数量，$C$ 就是通道数（即上文提到的 1024） 
> - 插值后输入： 经过语义空间插值（Semantic Space Interpolation）后，序列被扩展为目标帧数 $F$（对应前文公式中的 $L$），输入进 Transformer Block 的张量维度变成了 $F \times N \times C$ 。
> - 预测输出： 经过 8 层 Transformer Block 处理后，输出的预测过渡嵌入依然保持 $F \times N \times C$ 的维度。
> 最终，这 $F$ 帧的语义嵌入序列会被送入视频扩散模型的 U-Net 中，作为交叉注意力的控制信号，逐帧指导视频的生成。

3. 特征注入解码 (Decoding)： 受到图像提示 (Image Prompt) 方法的启发，这些预测出的语义嵌入会被当作控制信号。在视频扩散模型进行解码时，对于每一帧的视频特征 $V_i$，模型会将文本嵌入 $T$ 与预测的图像语义嵌入 $P_i$ 拼接起来，并在 U-Net 的交叉注意力中进行计算：
   $$V_i = \text{CrossAttention}(V_i, \text{concat}(T, P_i), \text{concat}(T, P_i))$$
   通过将图像编码到语义空间以整合空间位置关系，Semantic Motion Predictor 能够更好地对运动信息进行建模，从而成功生成包含大幅度平滑运动的过渡视频

---
# 实验设计与评估
## 数据集
StoryDiffusion 需要训练模型理解“如何根据起点和终点，预测中间符合物理规律的运动”，这需要海量真实的视频数据来让模型学习真实世界物体移动、镜头平移的先验知识。
论文中明确提到，在训练过渡视频模型（Semantic Motion Predictor）时，他们使用了 WebVid-10M 数据集。
WebVid-10M（全称 WebVid-10 Million）是目前学术界进行文本到视频（Text-to-Video）生成研究最常用的开源大规模数据集之一（由 Bain 等人在 2021 年提出）。
顾名思义，它包含了大约 1000 万个短视频片段（通常是几秒钟到十几秒的素材视频，带有水印），并且每个视频都配有详细的自然语言描述。

## 图像一致性评价指标
在评估一致性自注意力模块时，论文使用了两个核心指标：文本-图像相似度 (Text-Image Similarity) 和角色相似度 (Character Similarity) 。它们的底层核心都是 CLIP Score。
CLIP 是 OpenAI 提出的一个图文匹配模型。它包含一个图像编码器和一个文本编码器，能把图片和文本映射到同一个高维特征空间里。如果一段文字和一张图片描述的是同一个东西，它们在这个空间里的向量夹角就会非常小（余弦相似度接近 1）。

计算公式（余弦相似度，Cosine Similarity）：
假设我们提取出了特征向量 $A$ 和特征向量 $B$：
$$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$
- Text-Image Similarity：$A$ 是提示词的文本向量，$B$ 是生成图像的图像向量。分数越高（$\uparrow$），说明生成的图越听文本的话。    
- Character Similarity：$A$ 和 $B$ 分别是同一个 Batch 里生成的两张不同图片的图像向量（用来特指人物脸部区域）。分数越高（$\uparrow$），说明这两张图里的人长得越像。

## 过渡视频连贯性评价指标
在评估视频生成质量时，单看一帧是不够的，核心是要看帧与帧之间的关系。论文使用了 LPIPS 和 CLIPSIM，并且分别计算了 `-first` 和 `-frames` 两种变体。
### LPIPS (Learned Perceptual Image Patch Similarity)
这是计算机视觉中用来衡量两张图片感知差异（视觉特征上的差异）的标准指标。传统指标（如 MSE）只计算像素差，而 LPIPS 利用预训练好的神经网络（如 VGG）提取深层特征来比较，更符合人类眼睛的直观感受。
- 指标特性： 这是一个距离度量，数值越低越好（$\downarrow$）。数值越低，说明两张图在人眼看来差异越小、过渡越平滑。
- 计算公式： 给定两张输入图像 $x$ 和 $x_0$，将它们送入预训练网络，提取第 $l$ 层的特征 $\hat{y}^l$ 和 $\hat{y}_0^l$：
    $$d(x, x_0) = \sum_l \frac{1}{H_l W_l} \sum_{h,w} \| w_l \odot (\hat{y}_{hw}^l - \hat{y}_{0hw}^l) \|_2^2$$
    _(简单来说：就是把两张图塞进神经网络，算出每一层特征图的差值的平方和，再加权求总。)_
### CLIPSIM (CLIP Similarity)
与 LPIPS 侧重于底层/中层的视觉感知不同，CLIPSIM 还是基于上面提到的 CLIP 余弦相似度，但在这里它是用来衡量视频帧之间的高层语义连贯性。
- 指标特性： 数值越高越好（$\uparrow$）**。

### "-first" 与 "-frames" 的区别
为了全面评估视频不闪烁、不崩坏，论文对 LPIPS 和 CLIPSIM 分别测了两种跨度：
1. -first (首帧对比)： 计算第 $1$ 帧与第 $2$ 帧、第 $1$ 帧与第 $3$ 帧... 第 $1$ 帧与第 $L$ 帧的相似度平均值。这反映了视频的整体连续性。如果视频后面彻底跑题变样了，这个分会很差。
2. -frames (相邻帧对比)： 计算第 $1$ 帧与第 $2$ 帧、第 $2$ 帧与第 $3$ 帧的相似度平均值。这反映了帧与帧之间的连续性。如果视频有突然的闪烁或动作卡顿，这个分数会很差。

## 对比实验
### 图像一致性对比
在连环画和故事生成中，一个完美的模型需要做到“既要、又要、还要”：既要主角长得一样，又要衣服一致，还要完美服从 Prompt 的动作指令。
**定性分析** 
论文精心挑选了 IP-Adapter 和 PhotoMaker 作为对手，并组合了不同的角色和动作提示词。
- IP-Adapter 的“失控”： 在“Stargazing with a telescope”的例子中，IP-Adapter 生成的图像直接丢失了“望远镜” ；在“A focused gamer...”的例子中，它在第二张图丢失了“狗”，第三张图丢失了“扑克牌” 。这完美印证了之前讨论的痛点：图像条件太强，导致文本控制力下降。
- PhotoMaker 的“换装秀”： PhotoMaker 虽然成功生成了符合文本的动作，但能明显看到同一行里人物的服装出现了巨大的差异（比如工装裤和草帽的款式完全变了），它无法保持服装（attire）的一致性。    
- StoryDiffusion 的全面碾压： 论文的方法在保持相同面部和相同服装的同时，还能精准符合提示词的描述。    
**定量分析：** 
这不仅是视觉感受，数据也支持这一点 。
- Text-Image Similarity ： 衡量图片是否听从文本指令。StoryDiffusion 拿到了 0.6586，超过了 IP-Adapter (0.6129) 和 PhotoMaker (0.6541) 。
- Character Similarity ： 衡量人物是否长得一样。StoryDiffusion (0.8950) 依然是第一名。    
- 核心结论： 即使在零训练的情况下，StoryDiffusion 依然在文本可控性和主体相似度上取得了最好的表现。

### 过渡视频生成对比
接下来看 Semantic Motion Predictor 的威力。这部分对比了目前最前沿的 SEINE 和 SparseCtrl。
**定性分析：**
这部分的对比非常惨烈。
- SEINE： 在“两人水下接吻”的例子中，中间帧直接损坏，然后突兀地跳到最后一帧；在第二个例子中，生成了损坏的手臂。
- SparseCtrl： 虽然连续性稍微好一点，但中间帧依然包含损坏的图像（比如出现了无数只手），且无法保持外观的连贯性。
- StoryDiffusion： 生成了非常平滑的运动，没有损坏的中间帧，并且严格遵守了物理空间关系，而不是仅仅在过渡中改变外观。这就印证了“语义空间”预测比“潜空间”插值更懂物理世界的运动规律。
**定量分析：**
评价视频质量主要看两个维度：画面的流畅度 (LPIPS) 和语义的连贯性 (CLIPSIM) 。
- **LPIPS-first / LPIPS-frames (越低越好)：** 衡量首帧与其他帧的差异，以及相邻帧的差异。StoryDiffusion 分别取得了 0.3794 和 0.1635 的最佳成绩 。
- **CLIPSIM-first / CLIPSIM-frames (越高越好)：** 衡量整体连续性和帧间连续性。StoryDiffusion 分别取得了 0.9606 和 0.9870，全面领先对手 。

除此之外，论文还做了一个用户调研，在图像生成上 72.8% 的用户偏好 StoryDiffusion，而在视频生成上，这个比例高达 82% 。

---
# 局限性与思考
## 重新审视注意力机制
- Self-Attention 的本质扩展： 在 DiT 中，作者直接用 Transformer Block 替换了传统的 U-Net，证明了 Self-Attention 在捕捉图像内部全局结构上的强大能力。而 StoryDiffusion 的巧妙之处在于，它证明了 Self-Attention 的“感受野”不必局限于单张图片。通过简单的张量拼接操作，它将 Self-Attention 的作用域扩展到了图像之间，实现了特征的跨图流动。
- 解耦控制的哲学： 很多的改进工作（如 IP-Adapter）喜欢在 Cross-Attention 上做文章来注入条件，但这往往会导致图像条件和文本条件的“神仙打架” 。StoryDiffusion 给出了一个优雅的解耦方案：Cross-Attention 专心听文本的话，Self-Attention 专心负责画面的结构和人物统一。这种不增加额外参数（免训练）的即插即用设计，非常值得在未来的算法架构设计中借鉴。

## 局限性
在论文的附录 C 中，作者非常坦诚地指出了 StoryDiffusion 目前面临的两个核心瓶颈，这也是未来值得继续研究的方向。
### 细微特征的失忆
尽管 Consistent Self-Attention 能很好地保持角色的面部和整体服装款式，但在一些非常细微的服装细节上（例如领带的样式、衣服上的小图案），依然会出现前后不一致的情况 。这和现有的其他先进方法（如 IP-Adapter）面临的困境相似 。
作者提到，在面对这种情况时，模型需要依赖更加详尽的文本提示词，来强制 Cross-Attention 去关注并修正这些细节。    
### 长视频生成的短视
为了支持长故事的生成并防止显存溢出，论文在时间维度上引入了滑动窗口机制 。这虽然消除了峰值显存对输入文本长度的依赖，使得生成长故事成为可能 。
但是，滑动窗口本质上是一种局部优化策略。当需要生成非常长的视频时，由于缺乏全局的信息交换，首尾帧之间或者相隔较远的帧之间，可能会逐渐失去连贯性，产生状态漂移 。因此，该方法目前还不能完美胜任超长视频的生成 。