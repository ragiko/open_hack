<?php
namespace Vg\Validator;

use Respect\Validation\Validator as v;

// http://documentup.com/Respect/Validation/
class UserEdit
{
    private $validator;
    private $errors = [];

    /**
     * バリデータを作成
     */
    public function __construct()
    {
        $this->validator = v::arr()
        ->key('name', v::string()->setName('name')->notEmpty()->length(4,255))
        ->key('email', v::email()->setName('mailaddress')->notEmpty()->length(1,255))
        ->key('birthday', v::oneOf(
                  v::regex('/\A[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\z/'),
                  v::equals('')
                  )->setName('birthday')
            )
        ;
    }

    /**
     * $input のバリデーションを行う
     *
     * @param  array   $input チェックする値を含む配列
     * @return boolean 有効かどうか
     */
    public function validate($input)
    {
        try {
            $this->validator->assert($input);
        } catch (\InvalidArgumentException $e) {
            $this->errors = $e->findMessages([
                                                 'name' => '名前を確認してください',
                                                 'mailaddress' => 'メールアドレスを確認してください',
                                                 'name.notEmpty' => '名前を入力してください',
                                                 'name.length' => '名前は{{minValue}}〜{{maxValue}}文字内で入力してください',
                                                 'mailaddress.email' => 'メールアドレスを入力してください',
                                                 'mailaddress.notEmpty' => 'メールアドレスを入力してください',
                                                 'mailaddress.length' => 'メールアドレスは{{minValue}}〜{{maxValue}}文字内で入力してください',
                                                 'birthday.regex' => '誕生日はyyyy-mm-dd形式で登録してください',
                                                 ]);

            return false;
        }

        return true;
    }

    /**
     * エラーメッセージの配列を返す
     */
    public function errors()
    {
        return $this->errors;
    }
}
