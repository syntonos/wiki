---
order: 7
---

# Fourier Series as Orthogonal Expansions

## Periodic Signals
Periodic signals cycle through a set of values --> a signal $x \in \mathbb{F}^\mathbb{R}$ is periodic when there exists $T>0$ such that $Shift_T(x)=x$. $T$ is then a period of $x$.

As always, $\mathbb{F}$ is $\mathbb{C}$ or $\mathbb{R}$ and $\mathbb{F}^\mathbb{R}$ is the set of all continuous-time $\mathbb{F}$ valued signals. 

### 9.1 Fact: If $x \in \mathbb{F}^\mathbb{R}$ is a decent non-constant periodic signal, then there exists a smallest $T_0>0$ that is a period of $x$.

$T_0$, the smallest period of $x$, is the *fundamental period of $x$*.

The fundamental frequency $\Omega_0$ is then $\frac{2\pi}{T_0}$.

As an example, $t \mapsto cos(\Omega t)$, $t \mapsto sin(\Omega t)$, and $t \mapsto e^{j\Omega t}$ all have fundamental period $\frac{2\pi}{\Omega_0}$.

### 9.2 Fact: If $x \in \mathbb{F}^\mathbb{R}$ is a decent periodic signal with fundamental period $T_0$, then all periods of $x$ are multiples of $T_0$. 

### 9.3 Fact: If $x_1$ has a fundamental period $T_1$ and $x_2$ has a fundamental period $T_2$ and both signals are decent, then the following statements hold:
1) If $\frac{T_1}{T_2}$ is a rational number, then every linear combination of the form $c_1x_1 + c_2x_2$ with scalars $c_1$ and $c_2$ in $\mathbb{F}$ is periodic. 
2) If for some choice of constants $c_1$ and $c_2$ in $\mathbb{F}$, the signal $x = c_1x_1 + c_2x_2$ is periodic, then $\frac{T_1}{T_2}$ is rational, and all $c_1x_1 + c_2x_2$ are periodic.

The fundamental period of $x = c_1x_1 + c_2x_2$ (if it exists) is *usually* the least common multiple of $T_1$ and $T_2$. Write $\frac{T_1}{T_2} = \frac{m}{n}$, then manipulate. $T_0 = nT_1 = mT_1.$ 

This is not always true! Take $x_1 = cos(t/2) + cos(t/3)$ and $x_2 = cos(t/3)$. Let $x = x_1 - x_2$. $T_1 = 12\pi$, $T_2 = 6\pi$, but $T_0 = 4\pi$. 

## Fourier Series

### 9.4 Fact: Fourier Series Existence
Let $x^2 \in \mathbb{C}^\mathbb{R}$ be a decent periodic signal taht has $T_0$ as a period and is piecewise differentiable on all intervals between its jumps. Let $\Omega_0 = \frac{2\pi}{T_0}$. Then there exist complex constants $c_k, k \in \mathbb{Z}$, such that the sequence
$$S_N(t) = \sum_{k=-N}^{N}c_ke^{jk\Omega_0t}$$
converges as $N \rightarrow \infty$ for every $t \in \mathbb{R}$ as follows: 

- if $t$ is a continuity point of $x$, then $lim_{N \rightarrow \infty} S_N(t) = x(t)$, and 
- if $t$ is a jump point, then $S_N(t)$ converges as $N \rightarrow \infty$ to the mean value of the jump. 

In shorthand, non-rigoriously, 
$$x(t) = \sum_{k=-\infty}^{\infty}c_ke^{jk\Omega_0t}$$
This is absolutely true for $x$ is continuous and piecewise differentiable. 

## 9.5 Fact: $\int_{0}^{T_0} e^{jm\Omega_0t}dt=\begin{cases} T_0 & m=0 \\ 0 & m \neq 0 \end{cases}$

We can then use this fact to calculate Fourier coefficients.

$$c_0 = \frac{1}{T_0}\int_{0}^{T_0}x(t)dt$$
$$c_k = \frac{1}{T_0}\int_{0}^{T_0}x(t)e^{-jk\Omega_0t}dt$$

You can actually perform these integrals over any interval of length $T_0$
## Inner-product spaces and Hilbert Spaces

## Orthogonal Expansions

## Fourier series as orthogonal expansions

### 9.13 Parseval's Theorem
Let $x$ and $y$ be decent periodic signals that have $T_0$ as a period. Let $\Omega_0 = \frac{2\pi}{T_0}$ and let

$$c_k = \frac{1}{T_0}\int_{0}^{T_0}x(t)e^{-jk\Omega_0t}dt\text{ for all } k \in \mathbb{Z}$$
and
$$d_k = \frac{1}{T_0}\int_{0}^{T_0}yt(t)e^{-jk\Omega_0t}dt \text{ for all } k \in \mathbb{Z}$$
Then {$c_k$} and {$d_k$} are $l^2$ sequences. Furthermore, 
$$\frac{1}{T_0} \int_{0}^{T_0}x(t)\overline{y(t)}dt = \sum_{k=-\infty}^{\infty}c_k\overline{d_k}$$
and, in particular, 
$$\frac{1}{T_0} \int_{0}^{T_0}|x(t)|^2dt = \sum_{k=-\infty}^{\infty}|c_k|^2$$

Essentially, energy across the entire signal is equivalent to the sum of energy across all the signal's harmonics (Fourier coefficients). 

## Why Fourier series?