<?php
namespace Vg\Validator;

use Respect\Validation\Validator as v;

// http://documentup.com/Respect/Validation/
class UserRegister
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
        ->key('password', v::string()->setName('password')->notEmpty()->length(6,64)->regex('/\A[0-9a-zA-Z&%$#!?_]{6,64}\z/'))
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
                                                 'name' => '名前を入力してください',
                                                 'mailaddress' => 'メールアドレスを入力してください',
                                                 'password' => 'パスワードを入力してください',
                                                 'name.notEmpty' => '名前を入力してください',
                                                 'name.length' => '名前は{{minValue}}〜{{maxValue}}文字内で入力してください',
                                                 'mailaddress.notEmpty' => 'メールアドレスを入力してください',
                                                 'mailaddress.email' => 'メールアドレスの形式を確認してください',
                                                 'mailaddress.length' => 'メールアドレスは{{minValue}}〜{{maxValue}}文字内で入力してください',
                                                 'password.notEmpty' => 'パスワードを入力してください',
                                                 'password.regex' => 'パスワードは半角英数&%$#!?_の組み合わせで登録してください',
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
