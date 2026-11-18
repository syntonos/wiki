---
order: 8
---

# Continuous-time Fourier Transforms

### 10.1 Definition: A complex-valued signal $t \mapsto x(t)$ and a complex-valed function $\Omega \mapsto \hat{X}(\Omega)$ are a Fourier transform pair when one or both of the following equations hold. 

$(\mathcal{F})$
$$\hat{X}(\Omega) = \int_{-\infty}^{\infty}x(t)e^{-j\Omega t}dt \text{ for all } \Omega \in \mathbb{R}$$

$(\mathcal{F}^{-1})$
$$x(t) = \frac{1}{2\pi}\int_{-\infty}^{\infty}\hat{X}(\Omega)e^{j\Omega t}d\Omega \text{ for all } t \in \mathbb{R}$$

### 10.2 Linearity: The Fourier Transform is linear in that linear combinations apply. 

### 10.3 Existence criteria for Foueir transforms

