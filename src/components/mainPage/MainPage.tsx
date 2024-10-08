import React, {useState} from 'react';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {solarizedlight} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Spin, message} from 'antd';

function MainPage() {
    const [sourceCode, setSourceCode] = useState('');
    const [diffResult, setDiffResult] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSourceCodeChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSourceCode(event.target.value);
    };

    const handleReset = () => {
        setSourceCode('');
        setDiffResult([]);
    };

    const handleRemoveComments = async () => {
        setLoading(true);
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
                            'content': `去除下列代码中的所有注释\n${sourceCode}`
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
            const message = data.output.choices[0].message.content
            const codeBlocks = extractCodeBlocks(message);
            let codeBlockStr = ''
            codeBlocks.forEach((codeBlock, index) => {
                codeBlockStr += `\n${codeBlock}`
            })
            let codeBlocksList = []
            codeBlocksList.push(codeBlockStr)
            console.log('codeBlocksList', codeBlocksList)
            setDiffResult(codeBlocksList);
        } catch (error) {
            console.error('去除注释失败:', error);
            message.error('去除注释失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    function extractCodeBlocks(text) {
        // const pattern = /```(.*?)```/gs;
        const pattern = /```(\w*)\n([\s\S]*?)\n```\s*/g;
        const matches = text.matchAll(pattern);
        // 创建一个数组来存储所有匹配的代码块
        const codeBlocks = [];
        console.log('matches', matches);
        if (matches) {
            // 遍历所有匹配项
            for (const match of matches) {
                // 将第二组捕获的内容添加到数组中
                codeBlocks.push(match[2]);
            }
            return codeBlocks;
        } else {
            return null;
        }
    }

    const handleScroll = (e: React.UIEvent<HTMLElement>, targetSelector: string) => {
        const target = document.querySelector(targetSelector);
        if (target) {
            (target as HTMLElement).scrollTop = e.currentTarget.scrollTop;
        }
    };

    const handleCopy = () => {
        const textToCopy = diffResult.join('\n');
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                message.success('代码复制成功');
            }).catch((error) => {
                console.error('复制失败:', error);
                message.error('复制失败，请重试');
            });
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                message.success('代码复制成功');
            } catch (error) {
                console.error('复制失败:', error);
                message.error('复制失败，请重试');
            }
            document.body.removeChild(textArea);
        }
    };

    return (
        <Spin spinning={loading}>
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold mb-4">注释优化工具</h1>
                <div className="flex flex-row flex-1" style={{maxHeight: '66vh'}}>
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
                            {diffResult}
                        </SyntaxHighlighter>
                    </div>
                </div>
                <div className="flex justify-center space-x-4 mt-8">
                    <button onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded">重置</button>
                    <button onClick={handleRemoveComments}
                            className="px-4 py-2 bg-blue-500 text-white rounded">去除注释
                    </button>
                    <button onClick={handleCopy} className="px-4 py-2 bg-blue-500 text-white rounded">复制优化后的代码
                    </button>
                </div>
            </div>
        </Spin>
    );
}

export default MainPage;