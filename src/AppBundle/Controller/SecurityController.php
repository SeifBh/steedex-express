<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class SecurityController extends Controller
{

    /**
     * @Route("/login", name="login")
     * @return Response
     */
    public function login()
    {
        try {

            // Your logic here...

            return new JsonResponse([
                $this->getUser()
            ]);

        } catch (\Exception $exception) {

            return new JsonResponse([
                'success' => false,
                'code'    => $exception->getCode(),
                'message' => $exception->getMessage(),
            ]);

        }
    }



}
