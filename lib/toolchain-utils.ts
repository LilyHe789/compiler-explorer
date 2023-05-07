// Copyright (c) 2020, Compiler Explorer Authors
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import path from 'path';

import {splitArguments} from './utils.js';

const clang_style_toolchain_flag = '--gcc-toolchain=';
const icc_style_toolchain_flag = '--gxx-name=';

export function getToolchainPathWithOptionsArr(compilerExe: string | null, options: string[]): string | false {
    const existingChain = options.find(elem => elem.includes(clang_style_toolchain_flag));
    if (existingChain) return existingChain.substring(16);

    const gxxname = options.find(elem => elem.includes(icc_style_toolchain_flag));
    if (gxxname) {
        return path.resolve(path.dirname(gxxname.substring(11)), '..');
    } else if (typeof compilerExe === 'string' && compilerExe.includes('/g++')) {
        return path.resolve(path.dirname(compilerExe), '..');
    } else {
        return false;
    }
}

export function getToolchainPath(compilerExe: string | null, compilerOptions?: string): string | false {
    const options = compilerOptions ? splitArguments(compilerOptions) : [];
    return getToolchainPathWithOptionsArr(compilerExe, options);
}

export function removeToolchainArg(compilerOptions: string[]): string[] {
    return compilerOptions.filter(
        elem => !elem.includes(clang_style_toolchain_flag) && !elem.includes(icc_style_toolchain_flag),
    );
}

export function replaceToolchainArg(compilerOptions: string[], newPath: string): string[] {
    return compilerOptions.map(elem => {
        if (elem.includes(clang_style_toolchain_flag)) {
            return clang_style_toolchain_flag + path.normalize(newPath);
        } else if (elem.includes(icc_style_toolchain_flag)) {
            return icc_style_toolchain_flag + path.normalize(newPath);
        }

        return elem;
    });
}

export function hasToolchainArg(options: string[]): boolean {
    const existingChain = options.find(
        elem => elem.includes(clang_style_toolchain_flag) || elem.includes(icc_style_toolchain_flag),
    );
    return !!existingChain;
}

export function getToolchainFlagFromOptions(options: string[]): string | false {
    for (const elem of options) {
        if (elem.includes(clang_style_toolchain_flag)) return clang_style_toolchain_flag;
        if (elem.includes(icc_style_toolchain_flag)) return icc_style_toolchain_flag;
    }

    return false;
}
