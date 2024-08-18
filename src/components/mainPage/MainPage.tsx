import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { diffLines } from 'diff';

function MainPage() {
    const [sourceCode, setSourceCode] = useState('');
    const [optimizedCode, setOptimizedCode] = useState('');
    const [diffResult, setDiffResult] = useState<string[]>([]);
    
    const handleSourceCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSourceCode(event.target.value);
        setOptimizedCode(event.target.value);
    };

    const handleReset = () => {
        setSourceCode('');
        setOptimizedCode('');
        setDiffResult([]);
    };

    const handleRemoveComments = async () => {
        try {
            const params = {
                'model': 'qwen-turbo',
                'input': {
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a helpful assistant.'
                        },
                        {
                            'role': 'user',
                            'content': `去除注释\n${sourceCode}`
                        }
                    ]
                },
                'parameters': {
                    'result_format': 'message'
                }
            };
            const response = await fetch(`${import.meta.env.VITE_API_URL}/v1/services/aigc/text-generation/generation`, {
                method: 'POST',
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const data = await response.json();
            setOptimizedCode(data.optimizedCode);
        } catch (error) {
            console.error('去除注释失败:', error);
            // 这里可以添加错误处理，比如显示一个错误消息给用户
        }
    };

    useEffect(() => {
        const diff = diffLines(sourceCode, optimizedCode);
        const formattedDiff = diff.map(part => {
            if (part.added) {
                return `<span style="background-color: #e6ffed;">${part.value}</span>`;
            } else if (part.removed) {
                return `<span style="background-color: #ffeef0;">${part.value}</span>`;
            } else {
                return part.value;
            }
        });
        setDiffResult(formattedDiff);
    }, [sourceCode, optimizedCode]);

    const handleScroll = (e: React.UIEvent<HTMLElement>, targetSelector: string) => {
        const target = document.querySelector(targetSelector);
        if (target) {
            (target as HTMLElement).scrollTop = e.currentTarget.scrollTop;
        }
    };

    return (
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold mb-4">注释优化工具</h1>
            <div className="flex flex-row flex-1" style={{ maxHeight: '66vh' }}>
                <div className="w-1/2 p-4">
                    <h2 className="text-xl font-semibold mb-2">源代码</h2>
                    <textarea
                        className="w-full h-full p-2 border rounded overflow-auto"
                        value={sourceCode}
                        onChange={handleSourceCodeChange}
                        placeholder="在此输入源代码..."
                        onScroll={(e) => handleScroll(e, '.syntax-highlighter')}
                        wrap="off"
                    />
                </div>
                <div className="w-1/2 p-4">
                    <h2 className="text-xl font-semibold mb-2">优化注释的代码</h2>
                    <SyntaxHighlighter
                        style={solarizedlight}
                        className="h-full overflow-auto syntax-highlighter"
                        onScroll={(e) => handleScroll(e, 'textarea')}
                        wrapLines={false}
                    >
                        {diffResult.join('')}
                    </SyntaxHighlighter>
                </div>
            </div>
            <div className="flex justify-center space-x-4 mt-8">
                <button onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded">重置</button>
                <button onClick={handleRemoveComments} className="px-4 py-2 bg-blue-500 text-white rounded">去除注释</button>
            </div>
        </div>
    );
}

export default MainPage;